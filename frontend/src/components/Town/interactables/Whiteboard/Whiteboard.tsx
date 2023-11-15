import React, { useEffect } from 'react';
import { Box, useToast } from '@chakra-ui/react';

import { Excalidraw } from '@excalidraw/excalidraw';
import useTownController from '../../../../hooks/useTownController';
import { WhiteboardPlayer } from '../../../../types/CoveyTownSocket';

export default function Whiteboard({ interactableId }: { interactableId: string }) {
  const townController = useTownController();
  const whiteboardController = townController.getWhiteboardAreaController(interactableId);

  const toast = useToast();

  useEffect(() => {
    const handleJoin = ({ player, isDrawer }: { player: WhiteboardPlayer; isDrawer: boolean }) => {
      const role = isDrawer ? 'Drawer' : 'Viewer';
      const message =
        player.id === townController.ourPlayer.id
          ? `You have join the whiteboard`
          : `${player.userName} has joined the whiteboard`;
      toast({
        title: `A wild ${role} has appeared!`,
        description: message,
        status: 'info',
      });
    };

    const handleNewDrawer = ({ player }: { player: WhiteboardPlayer }) => {
      const message =
        player.id === townController.ourPlayer.id
          ? `You have become the Drawer, the holder of Excalidraw`
          : `${player.userName} has become the Drawer, the holder of Excalidraw`;
      toast({
        title: `New Drawer has emerged!`,
        description: message,
        status: 'info',
      });
    };

    const handleLeave = ({ player }: { player: WhiteboardPlayer }) => {
      toast({
        title: `Player Leave`,
        description: `Player ${player.userName} has returned to the shadow realm`,
        status: 'info',
      });
    };

    whiteboardController.addListener('whiteboardPlayerJoin', handleJoin);
    whiteboardController.addListener('whiteboardNewDrawer', handleNewDrawer);
    whiteboardController.addListener('whiteboardPlayerLeave', handleLeave);

    return () => {
      whiteboardController.removeListener('whiteboardPlayerJoin', handleJoin);
      whiteboardController.removeListener('whiteboardNewDrawer', handleNewDrawer);
      whiteboardController.removeListener('whiteboardPlayerLeave', handleLeave);
    };
  }, [whiteboardController, toast, townController.ourPlayer.id]);

  return (
    <>
      <Box h={'xl'} w={['sm', 'xl', '6xl']}>
        <Excalidraw />
      </Box>
    </>
  );
}
