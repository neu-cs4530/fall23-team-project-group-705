import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { useCallback, useEffect } from 'react';
import { useInteractable } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import Whiteboard from './Whiteboard';
import WhiteboardArea from './WhiteboardArea';

export default function WhiteboardModal(): JSX.Element {
  const townController = useTownController();
  const newWhiteboard = useInteractable<WhiteboardArea>('whiteboardArea');

  // useEffect(() => {
  //   if (newWhiteboard) {
  //     coveyTownController.pause();
  //   } else {
  //     coveyTownController.unPause();
  //   }
  // }, [coveyTownController, newWhiteboard]);

  // const closeModal = useCallback(() => {
  //   if (newWhiteboard) {
  //     coveyTownController.interactEnd(newWhiteboard);
  //   }
  // }, [coveyTownController, newWhiteboard]);

  const onClose = useCallback(() => {
    if (newWhiteboard) {
      townController.interactEnd(newWhiteboard);
      console.log(newWhiteboard);
      const whiteboardController = townController.getWhiteboardAreaController(newWhiteboard);
      whiteboardController.leaveArea();
    }
  }, [townController, newWhiteboard]);
  return (
    <Modal isOpen={newWhiteboard !== undefined} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW={'fit-content'} maxH={'fit-content'} margin={'2'}>
        <ModalHeader paddingBottom={0}>Whiteboard</ModalHeader>
        <ModalCloseButton />
        <Whiteboard />
      </ModalContent>
    </Modal>
  );
}
