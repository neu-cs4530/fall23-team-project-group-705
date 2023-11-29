import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import { BoundingBox, TownEmitter } from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import WhiteboardArea from '../WhiteboardArea';
import PictionaryGameArea from './PictionaryGameArea';
import TicTacToeGameArea from './TicTacToeGameArea';

/**
 * Creates a new GameArea from a map object
 * @param mapObject the map object to create the game area from
 * @param broadcastEmitter a broadcast emitter that can be used to emit updates to players
 * @returns the interactable area
 * @throws an error if the map object is malformed
 */
export default function GameAreaFactory(
  mapObject: ITiledMapObject,
  broadcastEmitter: TownEmitter,
): InteractableArea[] {
  const { name, width, height } = mapObject;
  if (!width || !height) {
    throw new Error(`Malformed viewing area ${name}`);
  }
  const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
  const gameType = mapObject.properties?.find(prop => prop.name === 'type')?.value;
  if (gameType === 'TicTacToe') {
    return [new TicTacToeGameArea(name, rect, broadcastEmitter)];
  }
  if (gameType === 'Pictionary') {
    const whiteboardArea = new WhiteboardArea(
      { id: `${name}WhiteboardArea`, occupants: [], viewers: [], drawer: undefined },
      { x: 0, y: 0, width: 0, height: 0 },
      broadcastEmitter,
    );
    return [new PictionaryGameArea(name, rect, broadcastEmitter), whiteboardArea];
  }
  throw new Error(`Unknown game area type ${mapObject.class}`);
}
