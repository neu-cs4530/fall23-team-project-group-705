import React, { useCallback, useEffect, useState } from 'react';
import { AlertStatus, Box, useToast } from '@chakra-ui/react';

import { Excalidraw } from '@excalidraw/excalidraw';
import useTownController from '../../../../hooks/useTownController';
import { WhiteboardPlayer } from '../../../../types/CoveyTownSocket';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

export default function Whiteboard({ interactableId }: { interactableId: string }) {
  const townController = useTownController();
  const whiteboardController = townController.getWhiteboardAreaController(interactableId);
  const [excalidrawState, setExcalidrawState] = useState<ExcalidrawImperativeAPI | null>();
  const [isDrawerState, setIsDrawerState] = useState<boolean>(false);
  const refCallback = useCallback(
    (value: ExcalidrawImperativeAPI | null) => setExcalidrawState(value),
    [],
  );
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
      toast({
        title,
        description,
        status,
        isClosable: true,
        position: 'top-right',
        duration: 2000,
      });
    },
    [toast],
  );

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
    };

    const handleNewDrawer = ({ player }: { player: WhiteboardPlayer }) => {
      const message =
        player.id === townController.ourPlayer.id
          ? `You have become the Drawer, the holder of Excalidraw`
          : `${player.userName} has become the Drawer, the holder of Excalidraw`;
      whiteboardToast({
        title: `New Drawer has emerged!`,
        description: message,
        status: 'success',
      });
      setIsDrawerState(whiteboardController.isDrawer());
    };

    const handleLeave = ({ player }: { player: WhiteboardPlayer }) => {
      whiteboardToast({
        title: `Player Leave`,
        description: `Player ${player.userName} has returned to the shadow realm`,
        status: 'info',
      });
      setIsDrawerState(whiteboardController.isDrawer());
    };

    const handleNewScene = ({ elements }: { elements: ExcalidrawElement[] }) => {
      excalidrawState?.updateScene({
        elements,
      });
    };

    whiteboardController.addListener('whiteboardPlayerJoin', handleJoin);
    whiteboardController.addListener('whiteboardNewDrawer', handleNewDrawer);
    whiteboardController.addListener('whiteboardPlayerLeave', handleLeave);
    whiteboardController.addListener('whiteboardNewScene', handleNewScene);

    return () => {
      whiteboardController.removeListener('whiteboardPlayerJoin', handleJoin);
      whiteboardController.removeListener('whiteboardNewDrawer', handleNewDrawer);
      whiteboardController.removeListener('whiteboardPlayerLeave', handleLeave);
      whiteboardController.removeListener('whiteboardNewScene', handleNewScene);
    };
  }, [whiteboardController, toast, townController.ourPlayer.id, excalidrawState, whiteboardToast]);

  return (
    <>
      <Box h={'xl'} w={['sm', 'xl', '6xl']}>
        <Excalidraw
          ref={refCallback}
          isCollaborating={true}
          viewModeEnabled={!isDrawerState}
          onChange={element => {
            if (isDrawerState) {
              whiteboardController.boardChange(element);
            }
          }}
        />
      </Box>
    </>
  );
}
