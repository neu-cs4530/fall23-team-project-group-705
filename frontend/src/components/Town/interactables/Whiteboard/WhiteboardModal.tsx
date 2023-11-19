import { Modal, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import React, { useCallback, useEffect } from 'react';
import { useInteractable } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import Whiteboard from './Whiteboard';
import WhiteboardArea from './WhiteboardArea';

export default function WhiteboardModal(): JSX.Element {
  const townController = useTownController();
  const whiteboardArea = useInteractable<WhiteboardArea>('whiteboardArea');

  useEffect(() => {
    if (whiteboardArea) {
      const whiteboardController = townController.getWhiteboardAreaController(whiteboardArea.id);
      whiteboardController.joinArea();
      townController.pause();
    }
  }, [townController, whiteboardArea]);

  const onClose = useCallback(() => {
    if (whiteboardArea) {
      townController.interactEnd(whiteboardArea);
      const whiteboardController = townController.getWhiteboardAreaController(whiteboardArea.id);
      whiteboardController.leaveArea();
      townController.unPause();
    }
  }, [townController, whiteboardArea]);

  if (whiteboardArea) {
    return (
      <Modal isOpen={whiteboardArea !== undefined} onClose={onClose} trapFocus={false}>
        <ModalOverlay />
        <ModalContent maxW={'fit-content'} maxH={'fit-content'} marginTop={10}>
          <ModalHeader paddingBottom={0}>Whiteboard</ModalHeader>
          <ModalCloseButton />
          <Whiteboard interactableId={whiteboardArea.id} />
        </ModalContent>
      </Modal>
    );
  }

  return <></>;
}
