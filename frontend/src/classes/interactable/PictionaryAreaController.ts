import { GameArea, GameStatus, PictionaryGameState, PlayerID } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';
export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';

export type PictionaryEvents = GameEventTypes & {
  wordChanged: (word: string) => void;
  turnChanged: (isOurTurn: boolean) => void;
};

/**
 * This class is responsible for managing the state of the Tic Tac Toe game, and for sending commands to the server
 */
export default class PictionaryAreaController extends GameAreaController<
  PictionaryGameState,
  PictionaryEvents
> {
  /**
   * Returns the current word being guessed.
   */
  get currentWord(): string {
    // If the game is not started and this field is accessed, should I throw an error like this:
    // if (!this._model.game) {
    //   throw Error(NO_GAME_IN_PROGRESS_ERROR);
    // }

    // Or should I just return a default value like this?
    if (!this._model.game) {
      return '';
    }

    return this._model.game.state.currentWord;
  }

  /**
   * Returns the player who is drawing, or undefined otherwise
   */
  get drawer(): PlayerController | undefined {
    const drawer = this._model.game?.state.drawer;
    if (drawer) {
      return this.occupants.find(eachOccupant => eachOccupant.id === drawer);
    }
    return undefined;
  }

  /**
   * Returns the winner of the game, if there is one
   */
  get winner(): PlayerController | undefined {
    const winner = this._model.game?.state.winner;
    if (winner) {
      return this.occupants.find(eachOccupant => eachOccupant.id === winner);
    }
    return undefined;
  }

  get isOurTurn(): boolean {
    return this.drawer?.id === this._townController.ourPlayer.id;
  }

  /**
   * Returns true if the current player is a player in this game
   */
  get isPlayer(): boolean {
    return this._model.game?.players.includes(this._townController.ourPlayer.id) || false;
  }

  /**
   * Returns the status of the game.
   * Defaults to 'WAITING_TO_START' if the game is not in progress
   */
  get status(): GameStatus {
    const status = this._model.game?.state.status;
    if (!status) {
      return 'WAITING_TO_START';
    }
    return status;
  }

  /**
   * Returns true if the game is in progress
   */
  public isActive(): boolean {
    return this._model.game?.state.status === 'IN_PROGRESS';
  }

  get score(): Record<PlayerID, number> | undefined {
    return this._model.game?.state.scores;
  }

  /**
   * Updates the internal state of this TicTacToeAreaController to match the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this game area and
   * other common properties (including this._model).
   *
   * If the board has changed, emits a 'boardChanged' event with the new board. If the board has not changed,
   *  does not emit the event.
   *
   * If the turn has changed, emits a 'turnChanged' event with true if it is our turn, and false otherwise.
   * If the turn has not changed, does not emit the event.
   */
  protected _updateFrom(newModel: GameArea<PictionaryGameState>): void {
    super._updateFrom(newModel);
  }

  /**
   * Sends a request to the server to make a move in the game
   *
   * If the game is not in progress, throws an error NO_GAME_IN_PROGRESS_ERROR
   *
   * @param guessWord the word that is being submitted as a guess.
   */
  public async makeGuess(guessWord: string) {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'IN_PROGRESS') {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    }
    await this._townController.sendInteractableCommand(this.id, {
      type: 'GameMove',
      gameID: instanceID,
      move: {
        guesser: this._townController.ourPlayer.id,
        guessWord,
      },
    });
  }

  public async startGame() {
    const instanceID = this._instanceID;
    if (!instanceID) {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    }
    await this._townController.sendInteractableCommand(this.id, {
      type: 'StartGame',
      gameID: instanceID,
    });
  }
}
