import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import { Payload } from '../../components/Town/interactables/Whiteboard/Whiteboard';
import {
  WhiteboardArea as WhiteboardAreaModel,
  WhiteboardPlayer,
  WhiteboardServerResponse,
} from '../../types/CoveyTownSocket';
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

  public get drawer() {
    return this._model.drawer;
  }

  public get viewers() {
    return this._model.viewers;
  }

  public isActive(): boolean {
    return this.occupants.length > 0;
  }

  public isDrawer(): boolean {
    return this._model.drawer === undefined
      ? true
      : this._model.drawer.id === this._townController.ourPlayer.id;
  }

  protected _updateFrom(newModel: WhiteboardAreaModel): void {
    // TODO: Update the board
  }

  public handleServerResponse(response: WhiteboardServerResponse) {
    if (response.type === 'WhiteboardPlayerJoin') {
      this._handlePlayerJoin(
        response.player,
        response.isDrawer,
        response.drawer,
        response.viewers,
        response.elements,
      );
    }

    if (response.type === 'WhiteboardPlayerLeave') {
      this._handlePlayerLeave(
        response.player,
        response.isDrawer,
        response.drawer,
        response.viewers,
      );
    }

    if (response.type === 'WhiteboardDrawerChange') {
      this._handleDrawerChange(response.elements);
    }

    if (response.type === 'WhiteboardPointerUpdate') {
      this._handlePointerUpdate(response.player, response.payload);
    }
  }

  private _handlePointerUpdate(player: WhiteboardPlayer, payload: unknown) {
    if (this._townController.ourPlayer.id !== player.id) {
      this.emit('whiteboardPointerUpdate', {
        player,
        payload,
      });
    }
  }

  private _handleDrawerChange(elements: unknown) {
    if (!this.isDrawer()) {
      this.emit('whiteboardNewScene', {
        elements,
      });
    }
  }

  private _handlePlayerJoin(
    player: WhiteboardPlayer,
    isDrawer: boolean,
    drawer: WhiteboardPlayer | undefined,
    viewers: WhiteboardPlayer[],
    elements: unknown,
  ) {
    this._model.drawer = drawer;
    this._model.viewers = viewers;

    if (this._townController.ourPlayer.id === player.id) {
      this.emit('whiteboardNewScene', {
        elements,
      });
    }

    this.emit('whiteboardPlayerJoin', {
      player,
      isDrawer,
    });
  }

  private _handlePlayerLeave(
    player: WhiteboardPlayer,
    isDrawer: boolean,
    drawer: WhiteboardPlayer | undefined,
    viewers: WhiteboardPlayer[],
  ) {
    this._model.drawer = drawer;
    this._model.viewers = viewers;

    if (isDrawer) {
      this.emit('whiteboardNewDrawer', {
        player: drawer,
      });
    }

    this.emit('whiteboardPlayerLeave', {
      player: player,
    });
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
      drawer: this._model.drawer,
      viewers: this._model.viewers,
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

  public async boardChange(elements: Readonly<ExcalidrawElement[]>) {
    await this._townController.sendInteractableCommand(this.id, {
      type: 'WhiteboardChange',
      elements,
    });
  }

  public async pointerChange(payload: Payload) {
    if (payload.pointersMap.size < 2) {
      await this._townController.sendInteractableCommand(this.id, {
        type: 'WhiteboardPointerChange',
        payload,
      });
    }
  }
}
