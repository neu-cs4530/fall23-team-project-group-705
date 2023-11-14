import PictionaryGame from './PictionaryGame';
import PictionaryWordlist from './PictionaryWordlist';

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
});
