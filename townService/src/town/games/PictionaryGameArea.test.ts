import { nanoid } from 'nanoid';
import { mock } from 'jest-mock-extended';
import {
  GameInstanceID,
  GameMove,
  PictionaryGameState,
  PictionaryMove,
  TownEmitter,
} from '../../types/CoveyTownSocket';
import Game from './Game';
import PictionaryGameArea from './PictionaryGameArea';
import * as PictionaryGameModule from './PictionaryGame';
import { createPlayerForTesting } from '../../TestUtils';
import Player from '../../lib/Player';
import {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
} from '../../lib/InvalidParametersError';

class TestingGame extends Game<PictionaryGameState, PictionaryMove> {
  public applyMove(move: GameMove<PictionaryMove>): void {
    throw new Error('Method not implemented.');
  }

  protected _join(player: Player): void {
    this._players.push(player);
  }

  protected _leave(player: Player): void {}

  public constructor() {
    super({
      status: 'WAITING_TO_START',
      currentWord: '',
      timer: 0,
    });
  }

  public endGame(winner?: string) {
    this.state = {
      ...this.state,
      status: 'OVER',
      winner,
    };
  }
}

describe('PictionaryGameArea', () => {
  let gameArea: PictionaryGameArea;
  let player1: Player;
  let player2: Player;
  let interactableUpdateSpy: jest.SpyInstance;
  let game: TestingGame;

  beforeEach(() => {
    const gameConstructorSpy = jest.spyOn(PictionaryGameModule, 'default');
    game = new TestingGame();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Testing without using the real game class)
    gameConstructorSpy.mockReturnValue(game);

    player1 = createPlayerForTesting();
    player2 = createPlayerForTesting();
    gameArea = new PictionaryGameArea(
      nanoid(),
      { x: 0, y: 0, width: 100, height: 100 },
      mock<TownEmitter>(),
      true,
    );
    gameArea.add(player1);
    gameArea.add(player2);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Test requires access to protected method)
    interactableUpdateSpy = jest.spyOn(gameArea, '_emitAreaChanged');
  });

  describe('handleCommand', () => {
    describe('[T3.1] when given a JoinGame command', () => {
      describe('when there is no game in progress', () => {
        it('should create a new game and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          expect(gameID).toBeDefined();
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(gameID).toEqual(game.id);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        });
      });
      describe('when there is a game in progress', () => {
        it('should dispatch the join command to the game and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);

          const joinSpy = jest.spyOn(game, 'join');
          const gameID2 = gameArea.handleCommand({ type: 'JoinGame' }, player2).gameID;
          expect(joinSpy).toHaveBeenCalledWith(player2);
          expect(gameID).toEqual(gameID2);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
        });
        it('should not call _emitAreaChanged if the game throws an error', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          interactableUpdateSpy.mockClear();

          const joinSpy = jest.spyOn(game, 'join').mockImplementationOnce(() => {
            throw new Error('Test Error');
          });
          expect(() => gameArea.handleCommand({ type: 'JoinGame' }, player2)).toThrowError(
            'Test Error',
          );
          expect(joinSpy).toHaveBeenCalledWith(player2);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
      });
    });
    describe('[T3.2] when given a GameMove command', () => {
      it('should throw an error when there is no game in progress', () => {
        expect(() =>
          gameArea.handleCommand(
            { type: 'GameMove', move: { col: 0, row: 0, gamePiece: 'X' }, gameID: nanoid() },
            player1,
          ),
        ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      });
      describe('when there is a game in progress', () => {
        let gameID: GameInstanceID;
        beforeEach(() => {
          gameID = gameArea.handleCommand({ type: 'JoinGame' }, player1).gameID;
          gameArea.handleCommand({ type: 'JoinGame' }, player2);
          interactableUpdateSpy.mockClear();
        });
        it('should throw an error when the game ID does not match', () => {
          expect(() =>
            gameArea.handleCommand(
              { type: 'GameMove', move: { col: 0, row: 0, gamePiece: 'X' }, gameID: nanoid() },
              player1,
            ),
          ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
        });
      });
    });
    describe('[T3.3] when given a LeaveGame command', () => {
      describe('when there is no game in progress', () => {
        it('should throw an error', () => {
          expect(() =>
            gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, player1),
          ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
      });
      describe('when there is a game in progress', () => {
        it('should throw an error when the game ID does not match', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          interactableUpdateSpy.mockClear();
          expect(() =>
            gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, player1),
          ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
        it('should dispatch the leave command to the game and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
          const leaveSpy = jest.spyOn(game, 'leave');
          gameArea.handleCommand({ type: 'LeaveGame', gameID }, player1);
          expect(leaveSpy).toHaveBeenCalledWith(player1);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
        });
        it('should not call _emitAreaChanged if the game throws an error', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          interactableUpdateSpy.mockClear();
          const leaveSpy = jest.spyOn(game, 'leave').mockImplementationOnce(() => {
            throw new Error('Test Error');
          });
          expect(() =>
            gameArea.handleCommand({ type: 'LeaveGame', gameID: game.id }, player1),
          ).toThrowError('Test Error');
          expect(leaveSpy).toHaveBeenCalledWith(player1);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
        it('should update the history if the game is over', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          gameArea.handleCommand({ type: 'JoinGame' }, player2);
          interactableUpdateSpy.mockClear();
          jest.spyOn(game, 'leave').mockImplementationOnce(() => {
            game.endGame(player1.id);
          });
          gameArea.handleCommand({ type: 'LeaveGame', gameID }, player1);
          expect(game.state.status).toEqual('OVER');
          expect(gameArea.history.length).toEqual(1);
          expect(gameArea.history[0]).toEqual({
            gameID: game.id,
            scores: {},
          });
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
