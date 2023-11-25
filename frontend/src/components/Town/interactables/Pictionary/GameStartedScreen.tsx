import { HStack, VStack, Heading, Flex, Input, Button, useToast } from "@chakra-ui/react";
import { Excalidraw } from "@excalidraw/excalidraw";
import EndGameScore from "./EndGameScore";
import PictionaryAreaController from "../../../../classes/interactable/PictionaryAreaController";
import { useEffect, useState } from "react";
import { GameStatus } from "../../../../types/CoveyTownSocket";
import PlayerController from "../../../../classes/PlayerController";

function GameStartedScreen(props: {gameAreaController: PictionaryAreaController}): JSX.Element {
  const gameAreaController: PictionaryAreaController = props.gameAreaController;

  const [isPlayer, setIsPlayer] = useState<boolean>(gameAreaController.isPlayer);
  const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status || 'WAITING_TO_START');
  const [drawer, setDrawer] = useState<PlayerController | undefined>(gameAreaController.drawer);
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
      setGameStatus(gameAreaController.status || 'WAITING_TO_START');
      setDrawer(gameAreaController.drawer);
      setCurrentWord(gameAreaController.currentWord);
      setTimer(gameAreaController.timer);
      setBetweenTurns(gameAreaController.betweenTurns);
    }, [
      gameAreaController.isPlayer,
      gameAreaController.status,
      gameAreaController.drawer,
      gameAreaController.currentWord,
      gameAreaController.timer,
      gameAreaController.betweenTurns,
    ]);

  return (
    <HStack h={'2xl'} w={['sm', '2xl', '6xl']} alignItems='top' margin={2}>
        <Excalidraw />
        <VStack width={250} spacing='12' paddingTop={4}>
        <div>
          <Heading as='h4' size='md'>
            {
              betweenTurns
              ? `${intermissionLength - timer} seconds until next turn.`
              : `${turnLength - timer} seconds left to ${gameAreaController.isOurTurn ? 'draw' : 'guess'}.`
            }
          </Heading>
        </div>
        {
          gameAreaController.isOurTurn || betweenTurns
          ? 
          <>
            <Heading as='h4' size='md'>{betweenTurns ? 'The word was:' : 'Your word:'}</Heading>
            {currentWord}
          </>
          : 
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
        }
        <EndGameScore scores={gameAreaController.scores}/>
      </VStack>
    </HStack>
  );
};
export default GameStartedScreen;