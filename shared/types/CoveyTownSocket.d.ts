export type TownJoinResponse = {
  /** Unique ID that represents this player * */
  userID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  sessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this town * */
  currentPlayers: Player[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
  /** Current state of interactables in this town */
  interactables: TypedInteractable[];
}

export type InteractableType = 'ConversationArea' | 'ViewingArea' | 'TicTacToeArea' | 'WhiteboardArea' | 'PictionaryArea';
export interface Interactable {
  type: InteractableType;
  id: InteractableID;
  occupants: PlayerID[];
}

export type TownSettingsUpdate = {
  friendlyName?: string;
  isPubliclyListed?: boolean;
}

export type Direction = 'front' | 'back' | 'left' | 'right';

export type PlayerID = string;
export interface Player {
  id: PlayerID;
  userName: string;
  location: PlayerLocation;
};

export type XY = { x: number, y: number };

export interface PlayerLocation {
  /* The CENTER x coordinate of this player's location */
  x: number;
  /* The CENTER y coordinate of this player's location */
  y: number;
  /** @enum {string} */
  rotation: Direction;
  moving: boolean;
  interactableID?: string;
};
export type ChatMessage = {
  author: string;
  sid: string;
  body: string;
  dateCreated: Date;
};

export interface ConversationArea extends Interactable {
  topic?: string;
};
export interface WhiteboardArea extends Interactable {
  drawer: WhiteboardPlayer | undefined;
  viewers: WhiteboardPlayer[];
};

export interface PictionaryArea extends Interactable {
  whiteboardModel: WhiteboardArea;
};
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface ViewingArea extends Interactable {
  video?: string;
  isPlaying: boolean;
  elapsedTimeSec: number;
}

export type GameStatus = 'IN_PROGRESS' | 'WAITING_TO_START' | 'OVER';
/**
 * Base type for the state of a game
 */
export interface GameState {
  status: GameStatus;
} 

/**
 * Type for the state of a game that can be won
 */
export interface WinnableGameState extends GameState {
  winner?: PlayerID;
}
/**
 * Base type for a move in a game. Implementers should also extend MoveType
 * @see MoveType
 */
export interface GameMove<MoveType> {
  playerID: PlayerID;
  gameID: GameInstanceID;
  move: MoveType;
}

export type TicTacToeGridPosition = 0 | 1 | 2;

/**
 * Type for a move in TicTacToe
 */
export interface TicTacToeMove {
  gamePiece: 'X' | 'O';
  row: TicTacToeGridPosition;
  col: TicTacToeGridPosition;
}

/**
 * Type for the state of a TicTacToe game
 * The state of the game is represented as a list of moves, and the playerIDs of the players (x and o)
 * The first player to join the game is x, the second is o
 */
export interface TicTacToeGameState extends WinnableGameState {
  moves: ReadonlyArray<TicTacToeMove>;
  x?: PlayerID;
  o?: PlayerID;
}

/**
 * Type for a move in Pictionary
 */
export interface PictionaryMove {
  guesser: PlayerID;
  guessWord: string;
}

/**
 * Type for the state of a Pictionary game
 * The state of the game is represented as: 
 * currentWord: The word the drawer is drawing
 * pastWords: The words that have already come up this game
 * drawer: the ID of the player who is currently drawing
 * alreadyGuessedCorrectly: a lsit of the IDs of all the players who have already guessed correctly and scored for this turn
 * scores: a record of the score for each player who has scored.
 */
export interface PictionaryGameState extends WinnableGameState {
  currentWord: string;
  timer: number;
  betweenTurns?: boolean;
  pastWords?: string[];
  drawer?: PlayerID;
  alreadyGuessedCorrectly?: PlayerID[];
  scores?: Record<PlayerID,number>;
}

export type InteractableID = string;
export type GameInstanceID = string;

/**
 * Type for the result of a game
 */
export interface GameResult {
  gameID: GameInstanceID;
  scores: { [playerName: string]: number };
}

/**
 * Base type for an *instance* of a game. An instance of a game
 * consists of the present state of the game (which can change over time),
 * the players in the game, and the result of the game
 * @see GameState
 */
export interface GameInstance<T extends GameState> {
  state: T;
  id: GameInstanceID;
  players: PlayerID[];
  result?: GameResult;
}

/**
 * Base type for an area that can host a game
 * @see GameInstance
 */
export interface GameArea<T extends GameState> extends Interactable {
  game: GameInstance<T> | undefined;
  history: GameResult[];
}

export type CommandID = string;

/**
 * Base type for a command that can be sent to an interactable.
 * This type is used only by the client/server interface, which decorates
 * an @see InteractableCommand with a commandID and interactableID
 */
interface InteractableCommandBase {
  /**
   * A unique ID for this command. This ID is used to match a command against a response
   */
  commandID: CommandID;
  /**
   * The ID of the interactable that this command is being sent to
   */
  interactableID: InteractableID;
  /**
   * The type of this command
   */
  type: string;
}

export type InteractableCommand =  ViewingAreaUpdateCommand | JoinGameCommand | GameMoveCommand<TicTacToeMove> | GameMoveCommand<PictionaryMove> | LeaveGameCommand | StartGameCommand | WhiteboardCommand;

export type WhiteboardCommand = WhiteboardJoin | WhiteboardLeave | WhiteboardChange | WhiteboardPointerChange | WhiteboardDrawerChange | WhiteboardClearDrawerChange;

export type WhiteboardJoin = {
  type: 'WhiteboardJoin';
}

export type WhiteboardLeave = {
  type: 'WhiteboardLeave';
}

export type WhiteboardChange = {
  type: 'WhiteboardChange';
  elements: unknown;
}

export type WhiteboardPointerChange = {
  type: 'WhiteboardPointerChange';
  payload: unknown;
}

export type WhiteboardDrawerChange = {
  type: 'WhiteboardDrawerChange';
  newDrawerId: string;
  eraseBoard?: boolean;
}

export type WhiteboardClearDrawerChange = {
  type: 'WhiteboardClearDrawerChange';
}

export interface ViewingAreaUpdateCommand  {
  type: 'ViewingAreaUpdate';
  update: ViewingArea;
}
export interface JoinGameCommand {
  type: 'JoinGame';
}
export interface LeaveGameCommand {
  type: 'LeaveGame';
  gameID: GameInstanceID;
}
export interface GameMoveCommand<MoveType> {
  type: 'GameMove';
  gameID: GameInstanceID;
  move: MoveType;
}
export interface StartGameCommand {
  type: 'StartGame';
  gameID: GameInstanceID;
}
export type InteractableCommandReturnType<CommandType extends InteractableCommand> = 
  CommandType extends JoinGameCommand ? { gameID: string}:
  CommandType extends ViewingAreaUpdateCommand ? undefined :
  CommandType extends GameMoveCommand<TicTacToeMove> ? undefined :
  CommandType extends LeaveGameCommand ? undefined :
  never;

export type InteractableCommandResponse<MessageType> = {
  commandID: CommandID;
  interactableID: InteractableID;
  error?: string;
  payload?: InteractableCommandResponseMap[MessageType];
}

export interface ServerToClientEvents {
  playerMoved: (movedPlayer: Player) => void;
  playerDisconnect: (disconnectedPlayer: Player) => void;
  playerJoined: (newPlayer: Player) => void;
  initialize: (initialData: TownJoinResponse) => void;
  townSettingsUpdated: (update: TownSettingsUpdate) => void;
  townClosing: () => void;
  chatMessage: (message: ChatMessage) => void;
  interactableUpdate: (interactable: Interactable) => void;
  commandResponse: (response: InteractableCommandResponse) => void;
  whiteboardReponse: (response: WhiteboardServerResponse) => void;
}

export type WhiteboardServerResponse = WhiteboardPlayerJoin | WhiteboardPlayerLeave | WhiteboardNewScene| WhiteboardPointerUpdate | WhiteboardNewDrawer | WhiteboardClearDrawer;

export type WhiteboardPlayer = {
  id: string;
  userName: string;
}

export type WhiteboardPlayerJoin = {
  id: string
  type: "WhiteboardPlayerJoin";
  player: WhiteboardPlayer;
  isDrawer: boolean;
  drawer: WhiteboardPlayer | undefined;
  viewers: WhiteboardPlayer[];
  elements: unknown;
}

export type WhiteboardPlayerLeave = {
  id: string
  type: "WhiteboardPlayerLeave";
  player: WhiteboardPlayer;
  isDrawer: boolean;
  drawer: WhiteboardPlayer | undefined;
  viewers: WhiteboardPlayer[];
}

export type WhiteboardNewScene = {
  id: string;
  type: "WhiteboardNewScene";
  elements: unknown;
}

export type WhiteboardPointerUpdate = {
  id: string;
  type: "WhiteboardPointerUpdate";
  player: WhiteboardPlayer;
  payload: unknown;
}

export type WhiteboardNewDrawer = {
  id: string;
  type: "WhiteboardNewDrawer";
  drawer: WhiteboardPlayer;
  viewers: WhiteboardPlayer[];
}

export type WhiteboardClearDrawer = {
  id: string;
  type: "WhiteboardClearDrawer";
  viewers: WhiteboardPlayer[];
}

export interface ClientToServerEvents {
  chatMessage: (message: ChatMessage) => void;
  playerMovement: (movementData: PlayerLocation) => void;
  interactableUpdate: (update: Interactable) => void;
  interactableCommand: (command: InteractableCommand & InteractableCommandBase) => void;
}