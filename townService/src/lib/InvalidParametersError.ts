export const INVALID_MOVE_MESSAGE = 'Invalid move';
export const INVALID_COMMAND_MESSAGE = 'Invalid command';

export const GAME_FULL_MESSAGE = 'Game is full';
export const GAME_STARTED_MESSAGE = 'Game is started';
export const GAME_NOT_IN_PROGRESS_MESSAGE = 'Game is not in progress';
export const GAME_ALREADY_IN_PROGRESS_MESSAGE = 'Game is already in progress';
export const GAME_OVER_MESSAGE = 'Game is over';
export const GAME_ID_MISSMATCH_MESSAGE = 'Game ID mismatch';
export const GAME_COMMAND_MISSMATCH_MESSAGE = 'Game command mismatch';

export const BOARD_POSITION_NOT_EMPTY_MESSAGE = 'Board position is not empty';
export const MOVE_NOT_YOUR_TURN_MESSAGE = 'Not your turn';

export const PLAYER_NOT_IN_GAME_MESSAGE = 'Player is not in this game';
export const PLAYER_ALREADY_IN_GAME_MESSAGE = 'Player is already in this game';
export const PLAYER_ALREADY_GUESSED_MESSAGE = 'Player has already guessed correctly';
export const DRAWER_UNDEFINED_MESSAGE = 'There is nobody drawing right now';
export const DRAWER_NOT_IN_GAME_MESSAGE = 'The drawer is not in this game';
export const TURN_ENDED_MESSAGE = 'This turn has already ended';
export default class InvalidParametersError extends Error {
  public message: string;

  public constructor(message: string) {
    super(message);
    this.message = message;
  }
}
