import { GameArea, GameStatus, PictionaryGameState, PlayerID } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';
import WhiteboardAreaController from './WhiteboardAreaController';
import TownController from '../TownController';

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
  private _whiteboardAreaController: WhiteboardAreaController;

  public constructor(
    id: string,
    gameArea: GameArea<PictionaryGameState>,
    townController: TownController,
    whiteboardAreaController: WhiteboardAreaController,
  ) {
    super(id, gameArea, townController);
    this._whiteboardAreaController = whiteboardAreaController;
  }

  /**
   * Returns the current word being guessed.
   */
  get currentWord(): string {
    if (!this._model.game) {
      return '';
    }

    return this._model.game.state.currentWord;
  }

  /**
   * Returns the current value of the timer, in seconds.
   */
  get timer(): number {
    if (!this._model.game) {
      return 0;
    }

    return this._model.game.state.timer;
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

  get weAlreadyGuessedCorrectly(): boolean {
    return this._model.game?.state.alreadyGuessedCorrectly?.includes(
      this._townController.ourPlayer.id,
    )
      ? true
      : false;
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

  get betweenTurns(): boolean {
    const betweenTurns = this._model.game?.state.betweenTurns;
    if (!betweenTurns) {
      return false;
    }
    return betweenTurns;
  }

  /**
   * Returns true if the game is in progress
   */
  public isActive(): boolean {
    return this._model.game?.state.status === 'IN_PROGRESS';
  }

  get scores(): Record<PlayerID, number> | undefined {
    return this._model.game?.state.scores;
  }

  private async _updateWhiteboard(
    joinGame: boolean,
    leaveGame: boolean,
    clearDrawer: boolean,
    newDrawer?: string,
  ): Promise<void> {
    if (joinGame) {
      await this._whiteboardAreaController.joinArea();
    } else if (leaveGame) {
      await this._whiteboardAreaController.leaveArea();
    }
    if (clearDrawer) {
      await this._whiteboardAreaController.clearDrawer();
    } else if (newDrawer) {
      await this._whiteboardAreaController.drawerChange(newDrawer, true);
    }
  }

  /**
   * Updates the internal state of this PictionaryAreaConroller to match the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this game area and
   * other common properties (including this._model).
   */
  protected _updateFrom(newModel: GameArea<PictionaryGameState>): void {
    const playerInCurrentModel =
      this._model.game !== undefined &&
      this._model.game.players.includes(this._townController.ourPlayer.id);
    const playerInNewModel =
      newModel.game !== undefined &&
      newModel.game.players.includes(this._townController.ourPlayer.id);
    const joinGame = !playerInCurrentModel && playerInNewModel;
    const leaveGame = playerInCurrentModel && !playerInNewModel;
    const newDrawer = newModel.game?.state.drawer;
    const isNewDrawer = this._model.game?.state.drawer !== newDrawer;
    const clearDrawer = isNewDrawer && newDrawer === undefined;

    if (isNewDrawer) {
      this._updateWhiteboard(joinGame, leaveGame, clearDrawer, newDrawer);
    } else {
      this._updateWhiteboard(joinGame, leaveGame, clearDrawer);
    }

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
