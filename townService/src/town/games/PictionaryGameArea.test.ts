import { nanoid } from 'nanoid';
import { mock } from 'jest-mock-extended';
import {
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

class TestingGame extends Game<PictionaryGameState, PictionaryMove> {
  public applyMove(move: GameMove<PictionaryMove>): void {
    throw new Error('Method not implemented.');
  }

  protected _join(player: Player): void {
    this._players.push(player);
  }

  protected _leave(player: Player): void {
    throw new Error('Method not implemented.');
  }

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
    );
    gameArea.add(player1);
    gameArea.add(player2);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Test requires access to protected method)
    interactableUpdateSpy = jest.spyOn(gameArea, '_emitAreaChanged');
  });

  describe('handleCommand', () => {
    describe('[T3.3] when given a LeaveGame command', () => {
      describe('when there is a game in progress', () => {
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
