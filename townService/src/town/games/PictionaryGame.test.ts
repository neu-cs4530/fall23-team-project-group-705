import PictionaryGame from './PictionaryGame';
import PictionaryWordlist from './PictionaryWordlist';
import { createPlayerForTesting } from '../../TestUtils';
import Player from '../../lib/Player';

describe('PictionaryGame', () => {
  let game: PictionaryGame;
  const wordlist: string[] = PictionaryWordlist();

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

    beforeEach(() => {
      player1 = createPlayerForTesting();
      player2 = createPlayerForTesting();
    });
    describe('once the game has started', () => {
      beforeEach(() => {
        game.join(player1);
        game.join(player2);
        game.startGame();
      });
      it('should do nothing on an incorrect guess', () => {
        const priorState = {
          ...game.state,
        }
        const move = {
          playerID: player2.id,
          gameID: game.id,
          move: {
            guesser: player2.id,
            guessWord: 'Not the correct word',
          }
        }
        game.applyMove(move);
        expect(priorState).toEqual(game.state);
      });
      it('should update scores and alreadyGuessedCorrectly, and nothing else', () => {
        const desiredNewState = {
          ...game.state,
          alreadyGuessedCorrectly: [player2.id],
          scores: {[player2.id]: 1}
        }
        const move = {
          playerID: player2.id,
          gameID: game.id,
          move: {
            guesser: player2.id,
            guessWord: game.state.currentWord,
          }
        }
        game.applyMove(move);
        expect(game.state).toEqual(desiredNewState);
      });
    })
  });
});
