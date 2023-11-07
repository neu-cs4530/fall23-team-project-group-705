import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import InvalidParametersError from '../lib/InvalidParametersError';
import Player from '../lib/Player';
import {
  BoundingBox,
  DrawingArea as DrawingAreaModel,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class DrawingArea extends InteractableArea {
  /** The drawong area is "active" when there are players inside of it  */
  public get isActive(): boolean {
    return this._occupants.length > 0;
  }

  /**
   * Creates a new DrawingArea
   *
   * @param conversationAreaModel model containing this area's current topic and its ID
   * @param coordinates  the bounding box that defines this drawing area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id }: Omit<DrawingAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
  }

  /**
   * Removes a player from this drawing area.
   *
   * Extends the base behavior of InteractableArea to set the topic of this DrawingArea to undefined and
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
   * Convert this DrawingArea instance to a simple DrawingAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): DrawingAreaModel {
    return {
      id: this.id,
      occupants: this.occupantsByID,
      type: 'DrawingArea',
    };
  }

  /**
   * Creates a new DrawingArea object that will represent a Drawing Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this drawing area exists
   * @param broadcastEmitter An emitter that can be used by this drawing area to broadcast updates
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): DrawingArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new DrawingArea({ id: name, occupants: [] }, rect, broadcastEmitter);
  }

  public handleCommand<
    CommandType extends InteractableCommand,
  >(): InteractableCommandReturnType<CommandType> {
    throw new InvalidParametersError('Unknown command type');
  }
}
