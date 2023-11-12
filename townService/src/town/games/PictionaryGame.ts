import InvalidParametersError, {
  GAME_NOT_IN_PROGRESS_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  GameMove,
  PictionaryGameState,
  PictionaryMove,
  PlayerID,
} from '../../types/CoveyTownSocket';
import Game from './Game';

/**
 * A PictionaryGame is a Game that implements the rules of Tic Tac Toe.
 * @see https://en.wikipedia.org/wiki/Tic-tac-toe
 */
export default class PictionaryGame extends Game<PictionaryGameState, PictionaryMove> {
  public constructor() {
    super({
      currentWord: '',
      status: 'WAITING_TO_START',
    });
  }

  private _currentWord = '';

  private _validateMove(move: PictionaryMove) {
    // A move is only valid if the player is not drawing
    if (move.guesser === this.state.drawer) {
      throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    }
    // A move is valid only if game is in progress
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
  }

  private _applyMove(move: PictionaryMove): void {
    // TODO: Apply move
  }

  /*
   * Applies a player's move to the game.
   * Uses the player's ID to determine which game piece they are using (ignores move.gamePiece)
   * Validates the move before applying it. If the move is invalid, throws an InvalidParametersError with
   * the error message specified below.
   * A move is invalid if:
   *    - The move is out of bounds (not in the 3x3 grid - use MOVE_OUT_OF_BOUNDS_MESSAGE)
   *    - The move is on a space that is already occupied (use BOARD_POSITION_NOT_EMPTY_MESSAGE)
   *    - The move is not the player's turn (MOVE_NOT_YOUR_TURN_MESSAGE)
   *    - The game is not in progress (GAME_NOT_IN_PROGRESS_MESSAGE)
   *
   * If the move is valid, applies the move to the game and updates the game state.
   *
   * If the move ends the game, updates the game's state.
   * If the move results in a tie, updates the game's state to set the status to OVER and sets winner to undefined.
   * If the move results in a win, updates the game's state to set the status to OVER and sets the winner to the player who made the move.
   * A player wins if they have 3 in a row (horizontally, vertically, or diagonally).
   *
   * @param move The move to apply to the game
   * @throws InvalidParametersError if the move is invalid
   */
  public applyMove(move: GameMove<PictionaryMove>): void {
    // TODO: Apply move

    const cleanMove: PictionaryMove = { guesser: '', guessWord: '' };
    this._validateMove(cleanMove);
    this._applyMove(cleanMove);
  }

  /**
   * Adds a player to the game.
   * Updates the game's state to reflect the new player.
   * If the game is now full (has two players), updates the game's state to set the status to IN_PROGRESS.
   *
   * @param player The player to join the game
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   *  or the game is full (GAME_FULL_MESSAGE)
   */
  protected _join(player: Player): void {
    if (this._playerInGame(player.id)) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (!this.state.drawer) {
      this.state = {
        ...this.state,
        drawer: player.id,
      };
    } else {
      this.state = {
        ...this.state,
        guessers: [player.id].concat(this.state.guessers !== undefined ? this.state.guessers : []),
      };
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
    if (!this._playerInGame(player.id)) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }

    // TODO: Implement leaving the game
  }

  private _playerInGame(playerID: PlayerID): boolean {
    return (
      this.state.drawer === playerID ||
      (this.state.guessers !== undefined &&
        this.state.guessers?.some(guesserID => guesserID === playerID))
    );
  }
}