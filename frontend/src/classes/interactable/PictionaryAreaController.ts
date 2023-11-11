import { useEffect, useState } from 'react';
import { PictionaryArea as PictionaryAreaModel } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';

/**
 * The events that the PictionaryAreaController emits to subscribers. These events
 * are only ever emitted to local components (not to the townService).
 */
export type PictionaryAreaEvents = BaseInteractableEventMap & {
  boardChange: (newBoard: any | undefined) => void;
};

/**
 * A PictionaryAreaController manages the local behavior of a pictionary area in the frontend,
 * implementing the logic to bridge between the townService's interpretation of pictionary areas and the
 * frontend's. The PictionaryAreaController emits events when the pictionary area changes.
 */
export default class PictionaryAreaController extends InteractableAreaController<
  PictionaryAreaEvents,
  PictionaryAreaModel
> {
  // TODO: Define boardstate type
  board: any = undefined;

  /**
   * Create a new PictionaryAreaController
   * @param id
   * @param topic
   */
  // constructor(id: string) {
  //   super(id);
  // }

  public isActive(): boolean {
    return this.occupants.length > 0;
  }

  protected _updateFrom(newModel: PictionaryAreaModel): void {
    // TODO: Update the board
  }

  /**
   * A pictionary area is empty if there are no occupants in it, or the topic is undefined.
   */
  isEmpty(): boolean {
    return this.occupants.length === 0;
  }

  /**
   * Return a representation of this PictionaryAreaController that matches the
   * townService's representation and is suitable for transmitting over the network.
   */
  toInteractableAreaModel(): PictionaryAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      type: 'PictionaryArea',
    };
  }

  /**
   * Create a new PictionaryAreaController to match a given PictionaryAreaModel
   * @param drawAreaModel Pictionary area to represent
   * @param playerFinder A function that will return a list of PlayerController's
   *                     matching a list of Player ID's
   */
  static fromPictionaryAreaModel(
    drawAreaModel: PictionaryAreaModel,
    playerFinder: (playerIDs: string[]) => PlayerController[],
  ): PictionaryAreaController {
    const ret = new PictionaryAreaController(drawAreaModel.id);
    ret.occupants = playerFinder(drawAreaModel.occupants);
    return ret;
  }
}

/**
 * A react hook to retrieve the board of a PictionaryAreaController.
 * If there is currently no topic defined, it will return NO_TOPIC_STRING.
 *
 * This hook will re-render any components that use it when the topic changes.
 */
export function usePictionaryAreaBoard(area: PictionaryAreaController): string {
  const [board, setBoard] = useState(area.board);
  useEffect(() => {
    area.addListener('boardChange', setBoard);
    return () => {
      area.removeListener('boardChange', setBoard);
    };
  }, [area]);
  return board;
}
