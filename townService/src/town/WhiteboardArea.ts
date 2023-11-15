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

  /** The whiteboard area is "active" when there are players inside of it  */
  public get isActive(): boolean {
    return this._occupants.length > 0;
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
      drawer: this._drawer,
      viewers: this._viewers,
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
    });
  }

  private _handleWhiteboardLeave(player: Player) {
    if (this._drawer !== undefined && this._drawer.id === player.id) {
      this._drawer = undefined;
      if (this._viewers.length > 0) {
        this._drawer = this._viewers.shift();
      }

      this._emitWhiteboardEvent({
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

      this._emitWhiteboardEvent({
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

  private _emitWhiteboardEvent(content: Omit<WhiteboardServerResponse, 'id'>) {
    try {
      this._townEmitter.emit('whiteboardReponse', {
        id: this.id,
        ...content,
      });
    } catch (err) {
      console.error(err);
    }
  }
}
