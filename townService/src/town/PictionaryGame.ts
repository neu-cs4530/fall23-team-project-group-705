import InvalidParametersError, {
  GAME_STARTED_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../lib/InvalidParametersError';
import Player from '../lib/Player';
import { GameMove, PictionaryGameState, TicTacToeMove } from '../types/CoveyTownSocket';
import Game from './games/Game';

/**
 * A TicTacToeGame is a Game that implements the rules of Tic Tac Toe.
 * @see https://en.wikipedia.org/wiki/Tic-tac-toe
 */
export default class PictionaryGame extends Game<PictionaryGameState, TicTacToeMove> {
  public constructor() {
    super({
      status: 'WAITING_TO_START',
    });
  }

  public applyMove(move: GameMove<TicTacToeMove>): void {
    throw new Error('Method not implemented.');
  }

  /**
   * Adds a player to the game.
   * Updates the game's state to reflect the new player.
   * If the game is now full (has two players), updates the game's state to set the status to IN_PROGRESS.
   *
   * @param player The player to join the game
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   *  or the game is started (GAME_FULL_MESSAGE)
   */
  protected _join(player: Player): void {
    if (this._players.includes(player)) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    } else if (this.state.status !== 'WAITING_TO_START') {
      throw new InvalidParametersError(GAME_STARTED_MESSAGE);
    } else {
      if (this._players.length === 0) {
        this.state.host = player.id;
      }
      this._players.push(player);
    }
  }

  /**
   * Removes a player from the game.
   * Updates the game's state to reflect the player leaving.
   * If the game has two players in it at the time of call to this method,
   *   updates the game's status to OVER and sets the winner to the other player.
   * If the game does not yet have two players in it at the time of call to this method,
   *   updates the game's status to WAITING_TO_START.
   *
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   */
  protected _leave(player: Player): void {
    if (!this._players.includes(player)) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (this.state.host === player.id) {
      const indexOfplayer: number = this._players.indexOf(player);
      if (indexOfplayer !== -1 && indexOfplayer < this._players.length - 1) {
        this.state.host = this._players[indexOfplayer + 1].id;
        this._players.splice(indexOfplayer, 1);
      } else {
        const indexOfthisplayer: number = this._players.indexOf(player);
        this._players.splice(indexOfthisplayer, 1);
      }
    }
  }

  public nextTurn(): void {}
}
