import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  GAME_ALREADY_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
  GAME_COMMAND_MISSMATCH_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  GameInstance,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
  PictionaryGameState,
  BoundingBox,
  TownEmitter,
} from '../../types/CoveyTownSocket';
import GameArea from './GameArea';
import PictionaryGame from './PictionaryGame';

/**
 * A PictionaryGameArea is a GameArea that hosts a PictionaryGame.
 * @see PictionaryGame
 * @see GameArea
 */
export default class PictionaryGameArea extends GameArea<PictionaryGame> {
  private _whiteboardID: string;

  public constructor(
    id: string,
    { x, y, width, height }: BoundingBox,
    townEmitter: TownEmitter,
    whiteboardID: string,
  ) {
    super(id, { x, y, width, height }, townEmitter);
    this._whiteboardID = whiteboardID;
    setTimeout(() => {
      this._tick();
    }, 1000);
  }

  protected getType(): InteractableType {
    return 'PictionaryArea';
  }

  public get whiteboardID() {
    return this._whiteboardID;
  }

  private _stateUpdated(updatedState: GameInstance<PictionaryGameState>) {
    if (updatedState.state.status === 'OVER') {
      // If we haven't yet recorded the outcome, do so now.
      const gameID = this._game?.id;
      if (gameID && !this._history.find(eachResult => eachResult.gameID === gameID)) {
        const { scores } = updatedState.state;
        if (scores) {
          /*
          const xName = this._occupants.find(eachPlayer => eachPlayer.id === x)?.userName || x;
          const oName = this._occupants.find(eachPlayer => eachPlayer.id === o)?.userName || o;
          this._history.push({
            gameID,
            scores: {
              [xName]: updatedState.state.winner === x ? 1 : 0,
              [oName]: updatedState.state.winner === o ? 1 : 0,
            },
          });
          */
        }
      }
    }
    this._emitAreaChanged();
  }

  /**
   * Handle a command from a player in this game area.
   * Supported commands:
   * - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
   * - GameMove (applies a move to the game)
   * - LeaveGame (leaves the game)
   *
   * If the command ended the game, records the outcome in this._history
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update, including any change to history)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
   *  - LeaveGame and GameMove: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *        or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   *  - Any command besides LeaveGame, GameMove and JoinGame: INVALID_COMMAND_MESSAGE
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'GameMove') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      // Check to ensure the movetype is PictionaryMove
      if (!('guesser' in command.move)) {
        throw new InvalidParametersError(GAME_COMMAND_MISSMATCH_MESSAGE);
      }
      game.applyMove({
        gameID: command.gameID,
        playerID: player.id,
        move: command.move,
      });
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'JoinGame') {
      let game = this._game;
      if (!game || game.state.status === 'OVER') {
        // No game in progress, make a new one
        game = new PictionaryGame(this.whiteboardID);
        this._game = game;
      }
      game.join(player);
      this._stateUpdated(game.toModel());
      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.leave(player);
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'StartGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.state.status === 'IN_PROGRESS') {
        throw new InvalidParametersError(GAME_ALREADY_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.startGame();
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }

  // Ticks the game forwards by one second, updating both back and frontend.
  private _tick(): void {
    if (this._game !== undefined) {
      this._game.tick();
      this._stateUpdated(this._game.toModel());
    }

    /*
     * Sets up the next tick for a second from now.
     * Ideally we should not have to use recursion, but for some reason calling this function with setInterval,
     * which would let us avoid recursion, means that this._game is read as undefined even after is has been updated.
     */
    setTimeout(() => {
      this._tick();
    }, 1000);
  }
}
