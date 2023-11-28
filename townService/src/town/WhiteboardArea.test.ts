import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { PlayerID, TownEmitter } from '../types/CoveyTownSocket';
import WhiteboardArea from './WhiteboardArea';

describe('WhiteboardArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let whiteboardArea: WhiteboardArea;
  const townEmitter = mock<TownEmitter>();
  const townEmitterSpy = jest.spyOn(townEmitter, 'emit');
  const id = nanoid();
  const occupants: PlayerID[] = [];

  const drawerEmitter = mock<TownEmitter>();
  const drawer = new Player('Drawer', drawerEmitter);
  const drawerSpy = jest.spyOn(drawerEmitter, 'emit');
  const whiteboardDrawer = {
    id: drawer.id,
    userName: drawer.userName,
  };

  const viewer1Emitter = mock<TownEmitter>();
  const viewer1Spy = jest.spyOn(viewer1Emitter, 'emit');
  const viewer1 = new Player('Viewer 1', viewer1Emitter);
  const whiteboardViewer1 = {
    id: viewer1.id,
    userName: viewer1.userName,
  };

  const viewer2Emitter = mock<TownEmitter>();
  const viewer2 = new Player('Viewer 2', viewer2Emitter);
  const viewer2Spy = jest.spyOn(viewer2Emitter, 'emit');
  const whiteboardViewer2 = {
    id: viewer2.id,
    userName: viewer2.userName,
  };

  beforeEach(() => {
    mockClear(townEmitter);
    whiteboardArea = new WhiteboardArea(
      { id, occupants, drawer: undefined, viewers: [] },
      testAreaBox,
      townEmitter,
    );
  });

  describe('handleCommand', () => {
    describe('WhiteboardJoin', () => {
      it('Add the first player as the drawer', () => {
        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardJoin',
          },
          drawer,
        );
        expect(townEmitterSpy).toHaveBeenLastCalledWith('whiteboardReponse', {
          id,
          type: 'WhiteboardPlayerJoin',
          player: whiteboardDrawer,
          drawer: whiteboardDrawer,
          isDrawer: true,
          viewers: [],
          elements: undefined,
        });
      });

      it('Add every player after as the viewer', () => {
        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardJoin',
          },
          drawer,
        );

        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardJoin',
          },
          viewer1,
        );

        expect(townEmitterSpy).toHaveBeenLastCalledWith('whiteboardReponse', {
          id,
          type: 'WhiteboardPlayerJoin',
          player: whiteboardViewer1,
          drawer: whiteboardDrawer,
          isDrawer: false,
          viewers: [whiteboardViewer1],
          elements: undefined,
        });

        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardJoin',
          },
          viewer2,
        );

        expect(townEmitterSpy).toHaveBeenLastCalledWith('whiteboardReponse', {
          id,
          type: 'WhiteboardPlayerJoin',
          player: whiteboardViewer2,
          drawer: whiteboardDrawer,
          isDrawer: false,
          viewers: [whiteboardViewer1, whiteboardViewer2],
          elements: undefined,
        });
      });

      it('Send the elements within the board to the new player when they join', () => {
        const elements = ['Placeholder 1', 'Placeholder 2'];
        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardJoin',
          },
          drawer,
        );

        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardChange',
            elements,
          },
          drawer,
        );

        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardJoin',
          },
          viewer1,
        );

        expect(townEmitterSpy).toHaveBeenLastCalledWith('whiteboardReponse', {
          id,
          type: 'WhiteboardPlayerJoin',
          player: whiteboardViewer1,
          drawer: whiteboardDrawer,
          isDrawer: false,
          viewers: [whiteboardViewer1],
          elements,
        });

        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardJoin',
          },
          viewer2,
        );

        expect(townEmitterSpy).toHaveBeenLastCalledWith('whiteboardReponse', {
          id,
          type: 'WhiteboardPlayerJoin',
          player: whiteboardViewer2,
          drawer: whiteboardDrawer,
          isDrawer: false,
          viewers: [whiteboardViewer1, whiteboardViewer2],
          elements,
        });
      });
    });
    describe('WhiteboardLeave', () => {
      beforeEach(() => {
        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardJoin',
          },
          drawer,
        );

        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardJoin',
          },
          viewer1,
        );

        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardJoin',
          },
          viewer2,
        );
      });

      it('Remove the viewer from the area', () => {
        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardLeave',
          },
          viewer1,
        );

        expect(townEmitterSpy).toHaveBeenLastCalledWith('whiteboardReponse', {
          id,
          type: 'WhiteboardPlayerLeave',
          player: whiteboardViewer1,
          drawer: whiteboardDrawer,
          isDrawer: false,
          viewers: [whiteboardViewer2],
        });
      });

      it('Remove the drawer from the area and let the first viewer become the new drawer', () => {
        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardLeave',
          },
          drawer,
        );

        expect(townEmitterSpy).toHaveBeenLastCalledWith('whiteboardReponse', {
          id,
          type: 'WhiteboardPlayerLeave',
          player: whiteboardDrawer,
          drawer: whiteboardViewer1,
          isDrawer: true,
          viewers: [whiteboardViewer2],
        });
      });

      it('Reset the board state when the last player leaves', () => {
        const elements = ['Placeholder 1', 'Placeholder 2'];
        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardChange',
            elements,
          },
          drawer,
        );

        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardLeave',
          },
          viewer1,
        );

        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardLeave',
          },
          viewer2,
        );

        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardLeave',
          },
          drawer,
        );

        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardJoin',
          },
          drawer,
        );

        expect(townEmitterSpy).toHaveBeenLastCalledWith('whiteboardReponse', {
          id,
          type: 'WhiteboardPlayerJoin',
          player: whiteboardDrawer,
          drawer: whiteboardDrawer,
          isDrawer: true,
          viewers: [],
          elements: [],
        });
      });
    });

    describe('WhiteboardChange', () => {
      const elements = ['Placeholder 1', 'Placeholder 2'];
      it('Sends the new scene changes to other viewers', () => {
        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardChange',
            elements,
          },
          drawer,
        );

        expect(drawerSpy).toHaveBeenLastCalledWith('whiteboardReponse', {
          id,
          type: 'WhiteboardNewScene',
          elements,
        });

        expect(townEmitterSpy).not.toHaveBeenLastCalledWith('whiteboardReponse');
      });
    });
    describe('WhiteboardPointerChange', () => {
      const payload = ['Placeholder 1', 'Placeholder 2'];
      it('Send the pointer update to the other viewers', () => {
        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardPointerChange',
            payload,
          },
          viewer1,
        );

        expect(viewer1Spy).toHaveBeenLastCalledWith('whiteboardReponse', {
          id,
          type: 'WhiteboardPointerUpdate',
          player: whiteboardViewer1,
          payload,
        });

        expect(townEmitterSpy).not.toHaveBeenLastCalledWith('whiteboardReponse');
      });
    });
    describe('WhiteboardDrawerChange', () => {
      beforeEach(() => {
        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardJoin',
          },
          drawer,
        );

        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardJoin',
          },
          viewer1,
        );

        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardJoin',
          },
          viewer2,
        );
      });

      it('Replace the old drawer with the new one', () => {
        whiteboardArea.handleCommand(
          {
            type: 'WhiteboardDrawerChange',
            newDrawerId: viewer2.id,
          },
          drawer,
        );

        expect(townEmitterSpy).toHaveBeenLastCalledWith('whiteboardReponse', {
          id,
          type: 'WhiteboardNewDrawer',
          drawer: whiteboardViewer2,
          viewers: [whiteboardViewer1, whiteboardDrawer],
        });
      });
    });
  });
});
