import {
  Button,
  FormControl,
  FormLabel,
  Input,
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
import { Omit_ConversationArea_type_ } from '../../../generated/client';
import useTownController from '../../../hooks/useTownController';

export default function DrawingModal(): JSX.Element {
  const coveyTownController = useTownController();
  const newDrawing = useInteractable('drawingArea');
  const [board, setBoard] = useState<any>();

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

  const toast = useToast();

  const createDrawing = useCallback(async () => {
    if (board && newDrawing) {
      const drawingToCreate = {
        id: newDrawing.name,
        occupants: [],
      };
      try {
        await coveyTownController.createDrawingArea(drawingToCreate);
        toast({
          title: 'Drawing Created!',
          status: 'success',
        });
        setBoard(undefined);
        coveyTownController.unPause();
        closeModal();
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to create drawing',
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
  }, [board, setBoard, coveyTownController, newDrawing, closeModal, toast]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Placeholder drawing interacteble named {newDrawing?.name} </ModalHeader>
        <ModalCloseButton />
        <form
          onSubmit={ev => {
            ev.preventDefault();
            createDrawing();
          }}>
          <ModalBody>
            <p>This is where the board would go.</p>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={createDrawing}>
              Create
            </Button>
            <Button onClick={closeModal}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
