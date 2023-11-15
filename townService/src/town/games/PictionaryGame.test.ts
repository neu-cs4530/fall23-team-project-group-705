import PictionaryGame from './PictionaryGame';
import PICTIONARY_WORDLIST from './PictionaryWordlist';
import { createPlayerForTesting } from '../../TestUtils';
import Player from '../../lib/Player';
import { GameMove, PictionaryMove, PlayerID } from '../../types/CoveyTownSocket';
import {
  GAME_STARTED_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';

describe('PictionaryGame', () => {
  let game: PictionaryGame;
  const wordlist: string[] = PICTIONARY_WORDLIST;

  beforeEach(() => {
    game = new PictionaryGame();
  });

  describe('newWord', () => {
    it('should change the currentWord', () => {
      const initialWord = game.state.currentWord;
      game.newWord();
      expect(game.state.currentWord).not.toEqual(initialWord);
    });
    it('should be initialized with a word from the wordlist', () => {
      expect(wordlist.some(word => word === game.state.currentWord)).toBeTruthy();
    });
    it('should get a new word from the wordlist', () => {
      game.newWord();
      expect(wordlist.some(word => word === game.state.currentWord)).toBeTruthy();
    });
  });
  describe('applyMove', () => {
    let player1: Player;
    let player2: Player;
    let player3: Player;
    const makeCorrectGuess: (playerID: PlayerID) => GameMove<PictionaryMove> = (
      playerID: PlayerID,
    ) => ({
      playerID,
      gameID: game.id,
      move: {
        guesser: playerID,
        guessWord: game.state.currentWord,
      },
    });

    const makeInorrectGuess: (playerID: PlayerID) => GameMove<PictionaryMove> = (
      playerID: PlayerID,
    ) => ({
      playerID,
      gameID: game.id,
      move: {
        guesser: playerID,
        guessWord: 'Incorrect guess',
      },
    });

    beforeEach(() => {
      player1 = createPlayerForTesting();
      player2 = createPlayerForTesting();
      player3 = createPlayerForTesting();
    });
    describe('once the game has started', () => {
      beforeEach(() => {
        game.join(player1);
        game.join(player2);
        game.startGame();
      });
      it('should assign the drawer', () => {
        expect(game.state.drawer).toEqual(player1.id);
      });
      it('should throw error when game is started', () => {
        game.state.status = 'IN_PROGRESS';
        expect(() => game.join(player3)).toThrowError(GAME_STARTED_MESSAGE);
      });
      it('should throw error when the a player join twice', () => {
        expect(() => game.join(player2)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
      });
      it('should throw error when the leave() enter a new player', () => {
        expect(() => game.leave(player3)).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      });
      it('should end the game when there is no player', () => {
        game.leave(player1);
        game.leave(player2);
        expect(game.state.status).toEqual('OVER');
      });
      it('should change the drawer when drawer leaves', () => {
        game.leave(player1);
        expect(game.state.drawer).toEqual(player2.id);
      });
      it('should change the drawer when turn changes', () => {
        game.nextTurn();
        expect(game.state.drawer).toEqual(player2.id);
      });
      it('should do nothing on an incorrect guess', () => {
        const priorState = {
          ...game.state,
        };
        game.applyMove(makeInorrectGuess(player2.id));
        expect(priorState).toEqual(game.state);
      });
      it('should update scores and alreadyGuessedCorrectly, and nothing else', () => {
        const desiredNewState = {
          ...game.state,
          alreadyGuessedCorrectly: [player2.id],
          scores: { [player2.id]: 1 },
        };
        game.applyMove(makeCorrectGuess(player2.id));
        expect(game.state).toEqual(desiredNewState);
      });
      // it('should update scores accurately for multiple players with multiple guesses', () => {
      //   const player3 = createPlayerForTesting();
      //   game.join(player3);

      //   game.applyMove(makeCorrectGuess(player2.id));
      //   game.applyMove(makeCorrectGuess(player3.id));
      //   expect(game.state).toEqual(desiredNewState);
      // });
    });
  });
});
