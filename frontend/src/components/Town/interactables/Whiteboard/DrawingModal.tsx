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

export default function DrawingModal(): JSX.Element {
  const coveyTownController = useTownController();
  const newDrawing = useInteractable('drawingArea');

  const isOpen = newDrawing !== undefined;

  useEffect(() => {
    if (newDrawing) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, newDrawing]);

  const closeModal = useCallback(() => {
    if (newDrawing) {
      coveyTownController.interactEnd(newDrawing);
    }
  }, [coveyTownController, newDrawing]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent maxW={'fit-content'} maxH={'fit-content'} margin={'2'}>
        <ModalHeader paddingBottom={0}>Whiteboard</ModalHeader>
        <ModalCloseButton />
        <ModalBody padding={1}>
          <Whiteboard />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
