import * as fs from 'fs';
import InvalidParametersError, {
  GAME_NOT_IN_PROGRESS_MESSAGE,
  GAME_STARTED_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { GameMove, PictionaryGameState, PictionaryMove } from '../../types/CoveyTownSocket';
import Game from './Game';

/**
 * A PictionaryGame is a Game that implements the rules of Pictionary.
 */
export default class PictionaryGame extends Game<PictionaryGameState, PictionaryMove> {
  private _wordlist: string[];

  public constructor() {
    super({
      currentWord: '',
      status: 'WAITING_TO_START',
    });
    this._wordlist = JSON.parse(
      fs.readFileSync(`${__dirname}/PictionaryWordlist.json`, { encoding: 'ascii' }),
    ) as string[];
    this.newWord();
  }

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
   * Selects a new, random word from the wordlist to be the currentWord.
   */
  public newWord(): void {
    this._wordlist = this._wordlist.filter(word => word !== this.state.currentWord);
    this.state = {
      ...this.state,
      pastWords: this.state.pastWords
        ? this.state.pastWords.concat(this.state.currentWord)
        : [this.state.currentWord],
      currentWord: this._getNewWord(),
    };
  }

  /**
   * Gets a random new word that has not been seen in this game before from the wordlist.
   */
  private _getNewWord(): string {
    return this._wordlist[Math.floor(Math.random() * this._wordlist.length)];
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
    if (this._players.includes(player)) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    } else if (this.state.status !== 'WAITING_TO_START') {
      throw new InvalidParametersError(GAME_STARTED_MESSAGE);
    } else {
      if (this._players.length === 0) {
        this.state.drawer = player.id;
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

    if (this.state.drawer === player.id) {
      const indexOfplayer: number = this._players.indexOf(player);
      if (indexOfplayer !== -1 && indexOfplayer < this._players.length - 1) {
        this.state.drawer = this._players[indexOfplayer + 1].id;
        this._players.splice(indexOfplayer, 1);
      } else {
        const indexOfthisplayer: number = this._players.indexOf(player);
        this._players.splice(indexOfthisplayer, 1);
      }
    }
  }
}
