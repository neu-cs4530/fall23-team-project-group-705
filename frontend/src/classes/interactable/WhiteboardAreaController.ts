import { WhiteboardArea as WhiteboardAreaModel } from '../../types/CoveyTownSocket';
import TownController from '../TownController';
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
  private _board: any = undefined;

  private _model: WhiteboardAreaModel;

  private _townController: TownController;

  /**
   * Create a new WhiteboardAreaController
   * @param id
   * @param topic
   */
  constructor(id: string, model: WhiteboardAreaModel, townController: TownController) {
    super(id);
    this._model = model;
    this._townController = townController;
  }

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

  public async leaveArea() {
    await this._townController.sendInteractableCommand(this.id, {
      type: 'WhiteboardLeave',
    });
  }

  public async joinArea() {
    await this._townController.sendInteractableCommand(this.id, {
      type: 'WhiteboardJoin',
    });
  }
}
