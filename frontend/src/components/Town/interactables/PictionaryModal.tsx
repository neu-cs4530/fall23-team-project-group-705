import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import WhiteBoardBoard from './WhiteBoard/WhiteBoardBoard';

export default function PictionaryModal(): JSX.Element {
  const coveyTownController = useTownController();
  const newPictionary = useInteractable('pictionaryArea');
  const [board, setBoard] = useState<unknown>();

  const isOpen = newPictionary !== undefined;

  useEffect(() => {
    if (newPictionary) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, newPictionary]);

  const closeModal = useCallback(() => {
    if (newPictionary) {
      coveyTownController.interactEnd(newPictionary);
    }
  }, [coveyTownController, newPictionary]);

  const toast = useToast();

  const createPictionary = useCallback(async () => {
    if (board && newPictionary) {
      const pictionaryToCreate = {
        id: newPictionary.name,
        occupants: [],
      };
      try {
        await coveyTownController.createPictionaryArea(pictionaryToCreate);
        toast({
          title: 'Game Created!',
          status: 'success',
        });
        setBoard(undefined);
        coveyTownController.unPause();
        closeModal();
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to create game',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected Error',
            status: 'error',
          });
        }
      }
    }
  }, [board, setBoard, coveyTownController, newPictionary, closeModal, toast]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent maxWidth={'10000px'}>
        <ModalHeader>Placeholder pictionary interacteble named {newPictionary?.name} </ModalHeader>
        <ModalCloseButton />
        <ModalBody></ModalBody>
        <ModalFooter>
          <Button onClick={closeModal}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
