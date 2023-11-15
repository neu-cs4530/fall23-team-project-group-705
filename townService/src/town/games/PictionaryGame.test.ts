import PictionaryGame from './PictionaryGame';
import PictionaryWordlist from './PictionaryWordlist';
import { createPlayerForTesting } from '../../TestUtils';
import Player from '../../lib/Player';
import { GameMove, PictionaryMove, PlayerID } from '../../types/CoveyTownSocket';

describe('PictionaryGame', () => {
  let game: PictionaryGame;
  const wordlist: string[] = PictionaryWordlist;

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
    const makeCorrectGuess: (playerID: PlayerID) => GameMove<PictionaryMove> = (playerID: PlayerID) => {
      return {
        playerID: playerID,
        gameID: game.id,
        move: {
          guesser: playerID,
          guessWord: game.state.currentWord,
        }
      }
    }

    const makeInorrectGuess: (playerID: PlayerID) => GameMove<PictionaryMove> = (playerID: PlayerID) => {
      return {
        playerID: playerID,
        gameID: game.id,
        move: {
          guesser: playerID,
          guessWord: 'Incorrect guess',
        }
      }
    }

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
        game.applyMove(makeInorrectGuess(player2.id));
        expect(priorState).toEqual(game.state);
      });
      it('should update scores and alreadyGuessedCorrectly, and nothing else', () => {
        const desiredNewState = {
          ...game.state,
          alreadyGuessedCorrectly: [player2.id],
          scores: {[player2.id]: 1}
        }
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
    })
  });
});
