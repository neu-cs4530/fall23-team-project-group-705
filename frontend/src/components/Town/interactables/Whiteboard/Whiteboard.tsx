import React, { useCallback, useEffect, useState } from 'react';
import { AlertStatus, VStack, useToast, Select, HStack, Button } from '@chakra-ui/react';

import { Excalidraw } from '@excalidraw/excalidraw';
import useTownController from '../../../../hooks/useTownController';
import { WhiteboardPlayer } from '../../../../types/CoveyTownSocket';
import { Collaborator, ExcalidrawImperativeAPI, Gesture } from '@excalidraw/excalidraw/types/types';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import throttle from 'lodash.throttle';

const THROTTLE_TIMEOUT = 20;

export default function Whiteboard({
  interactableId,
  isPictionaryWhiteboard,
}: {
  interactableId: string;
  isPictionaryWhiteboard: boolean;
}) {
  const townController = useTownController();
  const whiteboardController = townController.getWhiteboardAreaController(interactableId);
  const [excalidrawState, setExcalidrawState] = useState<ExcalidrawImperativeAPI | null>();
  const refCallback = useCallback(
    (value: ExcalidrawImperativeAPI | null) => setExcalidrawState(value),
    [],
  );

  const [isDrawerState, setIsDrawerState] = useState<boolean>(false);
  const [viewers, setViewers] = useState(whiteboardController.viewers);

  const toast = useToast();

  const whiteboardToast = useCallback(
    ({
      title,
      description,
      status,
    }: {
      title: string;
      description: string;
      status: AlertStatus;
    }) => {
      if (!isPictionaryWhiteboard) {
        toast({
          title,
          description,
          status,
          isClosable: true,
          position: 'top-right',
          duration: 2000,
        });
      }
    },
    [toast, isPictionaryWhiteboard],
  );

  const setCollaborators = useCallback(
    ({
      newDrawer,
      newViewers,
    }: {
      newDrawer: WhiteboardPlayer | undefined;
      newViewers: WhiteboardPlayer[];
    }) => {
      const newCollaborators = new Map<string, Collaborator>();
      if (newDrawer) {
        newCollaborators.set(newDrawer.id, {
          id: newDrawer.id,
          username: newDrawer.userName,
        });
      }

      newViewers.forEach(newViewer => {
        newCollaborators.set(newViewer.id, {
          id: newViewer.id,
          username: newViewer.userName,
        });
      });

      excalidrawState?.updateScene({
        collaborators: newCollaborators,
      });
    },
    [excalidrawState],
  );

  // Initialize state
  useEffect(() => {
    setIsDrawerState(whiteboardController.isDrawer());
    setViewers(whiteboardController.viewers);
    setCollaborators({
      newDrawer: whiteboardController.drawer,
      newViewers: whiteboardController.viewers,
    });
  }, [setCollaborators, whiteboardController]);

  useEffect(() => {
    const handleJoin = ({ player, isDrawer }: { player: WhiteboardPlayer; isDrawer: boolean }) => {
      const role = isDrawer ? 'Drawer' : 'Viewer';
      const message =
        player.id === townController.ourPlayer.id
          ? `You have joined the whiteboard`
          : `${player.userName} has joined the whiteboard`;
      whiteboardToast({
        title: `A wild ${role} has appeared!`,
        description: message,
        status: 'info',
      });
      setIsDrawerState(whiteboardController.isDrawer());
      setViewers(whiteboardController.viewers);
      setCollaborators({
        newDrawer: whiteboardController.drawer,
        newViewers: whiteboardController.viewers,
      });
    };

    const handleNewDrawer = ({ player }: { player: WhiteboardPlayer }) => {
      const isNewDrawer = player.id === townController.ourPlayer.id;
      const message = isNewDrawer
        ? `You have become the Drawer, the holder of Excalidraw`
        : `${player.userName} has become the Drawer, the holder of Excalidraw`;
      whiteboardToast({
        title: `New Drawer has emerged!`,
        description: message,
        status: isNewDrawer ? 'success' : 'info',
      });
      setIsDrawerState(whiteboardController.isDrawer());
      setViewers(whiteboardController.viewers);
      setCollaborators({
        newDrawer: whiteboardController.drawer,
        newViewers: whiteboardController.viewers,
      });
    };

    const handleClearDrawer = () => {
      setIsDrawerState(false);
      setViewers(whiteboardController.viewers);
      setCollaborators({
        newDrawer: undefined,
        newViewers: whiteboardController.viewers,
      });
    };

    const handleLeave = ({ player }: { player: WhiteboardPlayer }) => {
      whiteboardToast({
        title: `Player Leave`,
        description: `Player ${player.userName} has returned to the shadow realm`,
        status: 'info',
      });
      setIsDrawerState(whiteboardController.isDrawer());
      setViewers(whiteboardController.viewers);
      setCollaborators({
        newDrawer: whiteboardController.drawer,
        newViewers: whiteboardController.viewers,
      });
    };

    const handleNewScene = ({ elements }: { elements: ExcalidrawElement[] }) => {
      excalidrawState?.updateScene({
        elements,
      });
    };

    const handlePointerUpdate = ({
      player,
      payload,
    }: {
      player: WhiteboardPlayer;
      payload: Payload;
    }) => {
      const currentCollabs = excalidrawState?.getAppState().collaborators;
      const playerInfo = currentCollabs?.get(player.id);
      currentCollabs?.set(player.id, {
        ...playerInfo,
        pointer: {
          ...payload.pointer,
        },
        button: payload.button,
      });

      excalidrawState?.updateScene({
        collaborators: new Map(currentCollabs),
      });
    };

    whiteboardController.addListener('whiteboardPlayerJoin', handleJoin);
    whiteboardController.addListener('whiteboardNewDrawer', handleNewDrawer);
    whiteboardController.addListener('whiteboardClearDrawer', handleClearDrawer);
    whiteboardController.addListener('whiteboardPlayerLeave', handleLeave);
    whiteboardController.addListener('whiteboardNewScene', handleNewScene);
    whiteboardController.addListener('whiteboardPointerUpdate', handlePointerUpdate);

    return () => {
      whiteboardController.removeListener('whiteboardPlayerJoin', handleJoin);
      whiteboardController.removeListener('whiteboardNewDrawer', handleNewDrawer);
      whiteboardController.removeListener('whiteboardClearDrawer', handleClearDrawer);
      whiteboardController.removeListener('whiteboardPlayerLeave', handleLeave);
      whiteboardController.removeListener('whiteboardNewScene', handleNewScene);
      whiteboardController.removeListener('whiteboardPointerUpdate', handlePointerUpdate);
    };
  }, [
    whiteboardController,
    toast,
    townController.ourPlayer.id,
    excalidrawState,
    whiteboardToast,
    setCollaborators,
  ]);

  return (
    <>
      <VStack h={'2xl'} w={['sm', '2xl', '6xl']} margin={2}>
        {isDrawerState && !isPictionaryWhiteboard && (
          <form
            onSubmit={event => {
              event.preventDefault();
              const newDrawerId = (event.target as any).drawerId.value;
              if (!newDrawerId) {
                whiteboardToast({
                  title: 'No new drawer selected',
                  description: 'Need to select a new drawer to change',
                  status: 'error',
                });
                return;
              }
              whiteboardController.drawerChange(newDrawerId);
            }}>
            <HStack justify={'center'}>
              <Select placeholder='Select new drawer' w={'2xs'} name={'drawerId'}>
                {viewers.map(viewer => (
                  <option key={viewer.id} value={viewer.id}>
                    {viewer.userName}
                  </option>
                ))}
              </Select>
              <Button type='submit'>Change Drawer</Button>
            </HStack>
          </form>
        )}
        <Excalidraw
          ref={refCallback}
          isCollaborating={true}
          viewModeEnabled={!isDrawerState}
          onChange={throttle(element => {
            if (isDrawerState) {
              whiteboardController.boardChange(element);
            }
          }, THROTTLE_TIMEOUT)}
          onPointerUpdate={throttle(payload => {
            whiteboardController.pointerChange(payload);
          }, THROTTLE_TIMEOUT)}
        />
      </VStack>
    </>
  );
}

export type Payload = {
  pointer: {
    x: number;
    y: number;
  };
  button: 'down' | 'up';
  pointersMap: Gesture['pointers'];
};
