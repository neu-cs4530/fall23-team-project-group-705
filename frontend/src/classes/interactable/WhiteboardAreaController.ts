import { useEffect, useState } from 'react';
import { WhiteboardArea as WhiteboardAreaModel } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';

/**
 * The events that the WhiteboardAreaController emits to subscribers. These events
 * are only ever emitted to local components (not to the townService).
 */
export type WhiteboardAreaEvent = BaseInteractableEventMap & {
  boardChange: (newBoard: any | undefined) => void;
};

/**
 * A WhiteboardAreaController manages the local behavior of a whiteboard area in the frontend,
 * implementing the logic to bridge between the townService's interpretation of whiteboard areas and the
 * frontend's. The WhiteboardAreaController emits events when the whiteboard area changes.
 */
export default class WhiteboardAreaController extends InteractableAreaController<
  WhiteboardAreaEvent,
  WhiteboardAreaModel
> {
  // TODO: Define boardstate type
  board: any = undefined;

  /**
   * Create a new WhiteboardAreaController
   * @param id
   * @param topic
   */
  // constructor(id: string) {
  //   super(id);
  // }

  public isActive(): boolean {
    return this.occupants.length > 0;
  }

  protected _updateFrom(newModel: WhiteboardAreaModel): void {
    // TODO: Update the board
  }

  /**
   * A whiteboard area is empty if there are no occupants in it, or the topic is undefined.
   */
  isEmpty(): boolean {
    return this.occupants.length === 0;
  }

  /**
   * Return a representation of this WhiteboardAreaController that matches the
   * townService's representation and is suitable for transmitting over the network.
   */
  toInteractableAreaModel(): WhiteboardAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      type: 'WhiteboardArea',
    };
  }

  /**
   * Create a new WhiteboardAreaController to match a given WhiteboardAreaModel
   * @param drawAreaModel Whiteboard area to represent
   * @param playerFinder A function that will return a list of PlayerController's
   *                     matching a list of Player ID's
   */
  static fromWhiteboardAreaModel(
    whiteboardAreaModel: WhiteboardAreaModel,
    playerFinder: (playerIDs: string[]) => PlayerController[],
  ): WhiteboardAreaController {
    const ret = new WhiteboardAreaController(whiteboardAreaModel.id);
    ret.occupants = playerFinder(whiteboardAreaModel.occupants);
    return ret;
  }
}

/**
 * A react hook to retrieve the board of a WhiteboardAreaController.
 * If there is currently no topic defined, it will return NO_TOPIC_STRING.
 *
 * This hook will re-render any components that use it when the topic changes.
 */
export function useWhiteboardArea(area: WhiteboardAreaController): string {
  const [board, setBoard] = useState(area.board);
  useEffect(() => {
    area.addListener('boardChange', setBoard);
    return () => {
      area.removeListener('boardChange', setBoard);
    };
  }, [area]);
  return board;
}
