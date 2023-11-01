import { useEffect, useState } from 'react';
import { DrawingArea as DrawingAreaModel } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';

/**
 * The events that the DrawingAreaController emits to subscribers. These events
 * are only ever emitted to local components (not to the townService).
 */
export type DrawingAreaEvents = BaseInteractableEventMap & {
  boardChange: (newBoard: any | undefined) => void;
};

/**
 * A DrawingAreaController manages the local behavior of a drawing area in the frontend,
 * implementing the logic to bridge between the townService's interpretation of drawing areas and the
 * frontend's. The DrawingAreaController emits events when the drawing area changes.
 */
export default class DrawingAreaController extends InteractableAreaController<
  DrawingAreaEvents,
  DrawingAreaModel
> {

  // Below is a placeholder for the board
  board: any = undefined

  /**
   * Create a new DrawingAreaController
   * @param id
   * @param topic
   */
  constructor(id: string) {
    super(id);
  }

  public isActive(): boolean {
    return this.occupants.length > 0;
  }

  protected _updateFrom(newModel: DrawingAreaModel): void {
    // Update the board here
  }

  /**
   * A drawing area is empty if there are no occupants in it, or the topic is undefined.
   */
  isEmpty(): boolean {
    return this.occupants.length === 0;
  }

  /**
   * Return a representation of this DrawingAreaController that matches the
   * townService's representation and is suitable for transmitting over the network.
   */
  toInteractableAreaModel(): DrawingAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      type: 'DrawingArea',
    };
  }

  /**
   * Create a new DrawingAreaController to match a given DrawingAreaModel
   * @param drawAreaModel Drawing area to represent
   * @param playerFinder A function that will return a list of PlayerController's
   *                     matching a list of Player ID's
   */
  static fromDrawingAreaModel(
    drawAreaModel: DrawingAreaModel,
    playerFinder: (playerIDs: string[]) => PlayerController[],
  ): DrawingAreaController {
    const ret = new DrawingAreaController(drawAreaModel.id);
    ret.occupants = playerFinder(drawAreaModel.occupants);
    return ret;
  }
}

/**
 * A react hook to retrieve the board of a DrawingAreaController.
 * If there is currently no topic defined, it will return NO_TOPIC_STRING.
 *
 * This hook will re-render any components that use it when the topic changes.
 */
export function useDrawingAreaBoard(area: DrawingAreaController): string {
  const [board, setBoard] = useState(area.board);
  useEffect(() => {
    area.addListener('boardChange', setBoard);
    return () => {
      area.removeListener('boardChange', setBoard);
    };
  }, [area]);
  return board;
}

