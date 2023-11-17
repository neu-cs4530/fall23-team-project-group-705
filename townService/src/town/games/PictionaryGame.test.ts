import PictionaryGame from './PictionaryGame';
import PICTIONARY_WORDLIST from './PictionaryWordlist';
import { createPlayerForTesting } from '../../TestUtils';
import Player from '../../lib/Player';
import { GameMove, PictionaryMove, PlayerID } from '../../types/CoveyTownSocket';

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

    const makeIncorrectGuess: (playerID: PlayerID) => GameMove<PictionaryMove> = (
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
        game.join(player3);
        game.startGame();
      });
      it('should do nothing on an incorrect guess', () => {
        const priorState = {
          ...game.state,
        };
        game.applyMove(makeIncorrectGuess(player2.id));
        expect(priorState).toEqual(game.state);
      });
      it('should update scores and alreadyGuessedCorrectly', () => {
        expect(game.state.alreadyGuessedCorrectly).toBeUndefined();
        expect(game.state.scores).toBeUndefined();
        game.applyMove(makeCorrectGuess(player2.id));
        expect(game.state.alreadyGuessedCorrectly).toEqual([player2.id]);
        expect(game.state.scores).toEqual({ [player2.id]: 1 });
      });
      it('should update scores accurately for multiple players with multiple guesses', () => {
        game.applyMove(makeCorrectGuess(player2.id));
        game.applyMove(makeIncorrectGuess(player3.id));

        let desiredScores = {
          [player2.id]: 1,
        };
        expect(game.state.scores).toEqual(desiredScores);

        game.applyMove(makeCorrectGuess(player3.id));

        desiredScores = {
          [player2.id]: 1,
          [player3.id]: 1,
        };
        expect(game.state.scores).toEqual(desiredScores);
      });
      it('should update scores accurately over multiple turns', () => {
        game.applyMove(makeCorrectGuess(player2.id));
        game.applyMove(makeCorrectGuess(player3.id));

        let desiredScores = {
          [player2.id]: 1,
          [player3.id]: 1,
        };
        expect(game.state.scores).toEqual(desiredScores);

        // Earlier both guessers guessed correctly, so the turn ended. This skips through the intermission.
        for (let i = 0; i < PictionaryGame.intermissionLength + 1; i++) {
          game.tick();
        }

        game.applyMove(makeCorrectGuess(player1.id));
        game.applyMove(makeCorrectGuess(player3.id));

        desiredScores = {
          [player1.id]: 1,
          [player2.id]: 1,
          [player3.id]: 2,
        };
        expect(game.state.scores).toEqual(desiredScores);
      });
    });
  });
});
