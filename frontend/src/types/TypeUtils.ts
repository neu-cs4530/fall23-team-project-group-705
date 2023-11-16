import {
  ConversationArea,
  Interactable,
  TicTacToeGameState,
  ViewingArea,
  WhiteboardArea,
  GameArea,
  PictionaryGameState,
} from './CoveyTownSocket';

/**
 * Test to see if an interactable is a conversation area
 */
export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return interactable.type === 'ConversationArea';
}

/**
 * Test to see if an interactable is a viewing area
 */
export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return interactable.type === 'ViewingArea';
}

/**
 * Test to see if an interactable is a whiteboard area
 */
export function isWhiteboardArea(interactable: Interactable): interactable is WhiteboardArea {
  return interactable.type === 'WhiteboardArea';
}

/**
 * Test to see if an interactable is a pictionary area
 */
export function isPictionaryArea(
  interactable: Interactable,
): interactable is GameArea<PictionaryGameState> {
  return interactable.type === 'PictionaryArea';
}

export function isTicTacToeArea(
  interactable: Interactable,
): interactable is GameArea<TicTacToeGameState> {
  return interactable.type === 'TicTacToeArea';
}
