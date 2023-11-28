import { HStack, VStack, Heading, Flex, Input, Button, useToast } from '@chakra-ui/react';
import { Excalidraw } from '@excalidraw/excalidraw';
import EndGameScore from './EndGameScore';
import PictionaryAreaController from '../../../../classes/interactable/PictionaryAreaController';
import React, { useEffect, useState } from 'react';
import Whiteboard from '../Whiteboard/Whiteboard';
import { InteractableID } from '../../../../types/CoveyTownSocket';

function GameStartedScreen(props: { gameAreaController: PictionaryAreaController, interactableID: InteractableID }): JSX.Element {
  const gameAreaController: PictionaryAreaController = props.gameAreaController;

  const [isPlayer, setIsPlayer] = useState<boolean>(gameAreaController.isPlayer);
  const [isOurTurn, setIsOurTurn] = useState<boolean>(gameAreaController.isOurTurn);
  const [currentWord, setCurrentWord] = useState<string>(gameAreaController.currentWord);
  const [betweenTurns, setBetweenTurns] = useState(gameAreaController.betweenTurns);
  const [timer, setTimer] = useState(gameAreaController.timer);
  const [guess, setGuess] = useState('');
  const toast = useToast();

  //TODO: Give these a single point of control for all classes
  // The length, in seconds. of one drawer's turn.
  const turnLength = 30;

  // The length, in seconds, between turns.
  const intermissionLength = 5;

  useEffect(() => {
    setIsPlayer(gameAreaController.isPlayer);
    setIsOurTurn(gameAreaController.isOurTurn);
    setCurrentWord(gameAreaController.currentWord);
    setTimer(gameAreaController.timer);
    setBetweenTurns(gameAreaController.betweenTurns);
  }, [
    gameAreaController.isPlayer,
    gameAreaController.isOurTurn,
    gameAreaController.currentWord,
    gameAreaController.timer,
    gameAreaController.betweenTurns,
  ]);

  const currentWordDisplay = (
    <>
      <Heading as='h4' size='md'>
        {betweenTurns ? 'The word was:' : 'Your word:'}
      </Heading>
      {currentWord}
    </>
  );

  return (
    <HStack h={'2xl'} w={['sm', '2xl', '6xl']} alignItems='top' margin={2}>
      <Whiteboard interactableId={`${props.interactableID}WhiteboardArea`} isPictionaryWhiteboard={true} />
      <VStack width={250} spacing='12' paddingTop={4}>
        <Heading as='h4' size='md'>
          {betweenTurns
            ? `${intermissionLength - timer} seconds until next turn.`
            : `${turnLength - timer} seconds left to ${isOurTurn ? 'draw' : 'guess'}.`}
        </Heading>
        {isPlayer ? (
          // If is player, display info based on role/game phase
          isOurTurn || betweenTurns ? (
            // Show current role to drawer/if we are in an intermission
            currentWordDisplay
          ) : (
            // Show guess field to guessers
            <>
              <Flex direction={'column'}>
                <Input
                  placeholder='Type your guess here'
                  value={guess}
                  onChange={event => setGuess(event.target.value)}
                  key='guessInput'
                />
                <Button
                  onClick={async () => {
                    try {
                      await gameAreaController.makeGuess(guess).then(() => {
                        setGuess('');
                        if (gameAreaController.weAlreadyGuessedCorrectly) {
                          toast({
                            title: 'Correct!',
                            status: 'success',
                          });
                        } else {
                          toast({
                            title: 'Incorrect.',
                            status: 'error',
                          });
                        }
                      });
                    } catch (e) {
                      toast({
                        title: 'Error making guess',
                        description: (e as Error).toString(),
                        status: 'error',
                      });
                    }
                  }}>
                  Guess
                </Button>
              </Flex>
            </>
          )
        ) : // Do not show guess box to observers. Only show the current word during intermission
        betweenTurns ? (
          currentWordDisplay
        ) : (
          <></>
        )}
        <EndGameScore scores={gameAreaController.scores} />
      </VStack>
    </HStack>
  );
}
export default GameStartedScreen;
