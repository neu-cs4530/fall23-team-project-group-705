import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import InvalidParametersError from '../lib/InvalidParametersError';
import Player from '../lib/Player';
import {
  BoundingBox,
  WhiteboardArea as WhiteboardAreaModel,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
  WhiteboardServerResponse,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class WhiteboardArea extends InteractableArea {
  private _drawer: Player | undefined;

  private _viewers: Player[] = [];

  // A copy of the drawer board, will be deleted when the last person leave the room
  private _elements: unknown;

  /** The whiteboard area is "active" when there are players inside of it  */
  public get isActive(): boolean {
    return this._drawer !== undefined || this._viewers.length > 0;
  }

  /**
   * Creates a new whiteboard area
   *
   * @param conversationAreaModel model containing this area's current topic and its ID
   * @param coordinates  the bounding box that defines this whiteboard area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id }: Omit<WhiteboardAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
  }

  /**
   * Removes a player from this whiteboard area.
   *
   * Extends the base behavior of InteractableArea to set the topic of this WhiteboardArea to undefined and
   * emit an update to other players in the town when the last player leaves.
   *
   * @param player
   */
  public remove(player: Player) {
    super.remove(player);
    if (this._occupants.length === 0) {
      // TODO: Clear board
      this._emitAreaChanged();
    }
  }

  /**
   * Convert this WhiteboardArea instance to a simple WhiteboardAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): WhiteboardAreaModel {
    return {
      id: this.id,
      occupants: this.occupantsByID,
      type: 'WhiteboardArea',
      drawer: this._drawer && {
        id: this._drawer.id,
        userName: this._drawer.userName,
      },
      viewers: this._viewers.map(viewer => ({
        id: viewer.id,
        userName: viewer.userName,
      })),
    };
  }

  /**
   * Creates a new WihteboardArea object that will represent a Whiteboard Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this whiteboard area exists
   * @param broadcastEmitter An emitter that can be used by this whiteboard area to broadcast updates
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): WhiteboardArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed whiteboard area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new WhiteboardArea(
      { id: name, occupants: [], viewers: [], drawer: undefined },
      rect,
      broadcastEmitter,
    );
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'WhiteboardJoin') {
      this._handleWhiteboardJoin(player);
    }

    if (command.type === 'WhiteboardLeave') {
      this._handleWhiteboardLeave(player);
    }

    if (command.type === 'WhiteboardChange') {
      this._handleWhiteboardChange(player, command.elements);
    }

    if (command.type === 'WhiteboardPointerChange') {
      this._handleWhiteboardPointerChange(player, command.payload);
    }

    if (command.type === 'WhiteboardDrawerChange') {
      this._handleWhiteboardDrawerChange(player, command.newDrawerId);
    }

    if (command.type === 'WhiteboardClearDrawerChange') {
      this._handleWhiteboardClearDrawerChange();
    }

    if (command.type === 'WhiteboardErase') {
      this._handleWhiteboardErase();
    }

    

    return undefined as InteractableCommandReturnType<CommandType>;
  }

  private _handleWhiteboardJoin(player: Player) {
    let isDrawer: boolean;

    if (this._drawer === undefined) {
      this._drawer = player;
      isDrawer = true;
    } else {
      this._viewers.push(player);
      isDrawer = false;
    }

    this._emitWhiteboardEvent({
      id: this.id,
      type: 'WhiteboardPlayerJoin',
      player: {
        id: player.id,
        userName: player.userName,
      },
      isDrawer,
      drawer: this._drawer && {
        id: this._drawer.id,
        userName: this._drawer.userName,
      },
      viewers: this._viewers.map(viewer => ({
        id: viewer.id,
        userName: viewer.userName,
      })),
      elements: this._elements,
    });
  }

  private _handleWhiteboardLeave(player: Player) {
    if (this._drawer !== undefined && this._drawer.id === player.id) {
      this._drawer = undefined;
      if (this._viewers.length > 0) {
        this._drawer = this._viewers.shift();
      }

      this._resetWhiteboardState();

      this._emitWhiteboardEvent({
        id: this.id,
        type: 'WhiteboardPlayerLeave',
        player: {
          id: player.id,
          userName: player.userName,
        },
        isDrawer: true,
        drawer: this._drawer && {
          id: this._drawer.id,
          userName: this._drawer.userName,
        },
        viewers: this._viewers.map(viewer => ({
          id: viewer.id,
          userName: viewer.userName,
        })),
      });

      return;
    }

    if (this._viewers.some(viewer => viewer.id === player.id)) {
      this._viewers = this._viewers.filter(viewer => viewer.id !== player.id);
      this._resetWhiteboardState();

      this._emitWhiteboardEvent({
        id: this.id,
        type: 'WhiteboardPlayerLeave',
        player: {
          id: player.id,
          userName: player.userName,
        },
        isDrawer: false,
        drawer: this._drawer && {
          id: this._drawer.id,
          userName: this._drawer.userName,
        },
        viewers: this._viewers.map(viewer => ({
          id: viewer.id,
          userName: viewer.userName,
        })),
      });

      return;
    }

    throw new InvalidParametersError(`Player with username: ${player.userName} doesn't exist`);
  }

  // elements is left as unknown since I didn't want to install excalidraw to the backend just for the types
  private _handleWhiteboardChange(player: Player, elements: unknown) {
    player.townEmitter.emit('whiteboardReponse', {
      id: this.id,
      type: 'WhiteboardNewScene',
      elements,
    });

    this._elements = elements;
  }

  private _handleWhiteboardPointerChange(player: Player, payload: unknown) {
    player.townEmitter.emit('whiteboardReponse', {
      id: this.id,
      type: 'WhiteboardPointerUpdate',
      player: {
        id: player.id,
        userName: player.userName,
      },
      payload,
    });
  }

  private _handleWhiteboardDrawerChange(player: Player, newDrawerId: string) {
    if ((this._drawer && newDrawerId === this._drawer.id)) {
      return;
    }

    const newDrawer = this._viewers.find(viewer => viewer.id === newDrawerId);
    this._viewers = this._viewers.filter(viewer => viewer.id !== newDrawerId);

    if (newDrawer === undefined) {
      return;
    }

    if (this._drawer) {
      this._viewers.push(this._drawer);
    }
    this._drawer = newDrawer;

    this._emitWhiteboardEvent({
      id: this.id,
      type: 'WhiteboardNewDrawer',
      drawer: this._drawer && {
        id: this._drawer.id,
        userName: this._drawer.userName,
      },
      viewers: this._viewers.map(viewer => ({
        id: viewer.id,
        userName: viewer.userName,
      })),
    });
  }

  private _handleWhiteboardClearDrawerChange() {
    if (this._drawer) {
      this._viewers.push(this._drawer);
    }
    this._drawer = undefined;

    this._emitWhiteboardEvent({
      id: this.id,
      type: 'WhiteboardClearDrawer',
      viewers: this._viewers.map(viewer => ({
        id: viewer.id,
        userName: viewer.userName,
      })),
    });
  }

  private _resetWhiteboardState() {
    if (!this.isActive) {
      this._elements = [];
    }
  }

  // For if we want to reset the whiteboard state while it is active
  private _handleWhiteboardErase() {
    const elements: unknown = [];
    console.log("Whiteboard area, erase board");
    this._townEmitter.emit('whiteboardReponse', {
      id: this.id,
      type: 'WhiteboardNewScene',
      elements,
    });

    this._elements = [];
  }

  private _emitWhiteboardEvent(content: WhiteboardServerResponse) {
    try {
      this._townEmitter.emit('whiteboardReponse', content);
    } catch (err) {
      // TODO: Remove this
      console.error(err);
    }
  }
}
