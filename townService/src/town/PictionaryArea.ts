import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import InvalidParametersError from '../lib/InvalidParametersError';
import Player from '../lib/Player';
import {
  BoundingBox,
  PictionaryArea as PictionaryAreaModel,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class PictionaryArea extends InteractableArea {
  /** The pictionary area is "active" when there are players inside of it  */
  public get isActive(): boolean {
    return this._occupants.length > 0;
  }

  /**
   * Creates a new PictionaryArea
   *
   * @param conversationAreaModel model containing this area's current topic and its ID
   * @param coordinates  the bounding box that defines this Pictionary area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id }: Omit<PictionaryAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
  }

  /**
   * Removes a player from this Pictionary area.
   *
   * Extends the base behavior of InteractableArea to set the topic of this PictionaryArea to undefined and
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
   * Convert this PictionaryArea instance to a simple PictionaryAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): PictionaryAreaModel {
    return {
      id: this.id,
      occupants: this.occupantsByID,
      type: 'PictionaryArea',
    };
  }

  /**
   * Creates a new PictionaryArea object that will represent a Pictionary Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this Pictionary area exists
   * @param broadcastEmitter An emitter that can be used by this Pictionary area to broadcast updates
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): PictionaryArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new PictionaryArea({ id: name, occupants: [] }, rect, broadcastEmitter);
  }

  public handleCommand<
    CommandType extends InteractableCommand,
  >(): InteractableCommandReturnType<CommandType> {
    throw new InvalidParametersError('Unknown command type');
  }
}
