import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  List,
  ListItem,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  UnorderedList,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { ExcalidrawContainerContext } from '@excalidraw/excalidraw/types/components/App';
import React, { useCallback, useEffect, useState } from 'react';
import PictionaryAreaController from '../../../../classes/interactable/PictionaryAreaController';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import {
  GameResult,
  GameStatus,
  InteractableID,
  PlayerID,
} from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';

/**
 * The PictionaryArea component renders the Pictionary game area.
 * It renders the current state of the area, optionally allowing the player to join the game.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It uses the PictionaryAreaController to get the current state of the game.
 * It listens for the 'gameUpdated' and 'gameEnd' events on the controller, and re-renders accordingly.
 * It subscribes to these events when the component mounts, and unsubscribes when the component unmounts. It also unsubscribes when the gameAreaController changes.
 *
 * It renders the following:
 * - A list of observers' usernames (in a list with the aria-label 'list of observers in the game', one username per-listitem)
 * - A list of players' usernames (in a list with the aria-label 'list of players in the game', one item for X and one for O)
 *    - If there is no player in the game, the username is '(No player yet!)'
 *    - List the players as (exactly) `X: ${username}` and `O: ${username}`
 * - A message indicating the current game status:
 *    - If the game is in progress, the message is 'Game in progress, {moveCount} moves in, currently {whoseTurn}'s turn'. If it is currently our player's turn, the message is 'Game in progress, {moveCount} moves in, currently your turn'
 *    - Otherwise the message is 'Game {not yet started | over}.'
 * - If the game is in status WAITING_TO_START or OVER, a button to join the game is displayed, with the text 'Join New Game'
 *    - Clicking the button calls the joinGame method on the gameAreaController
 *    - Before calling joinGame method, the button is disabled and has the property isLoading set to true, and is re-enabled when the method call completes
 *    - If the method call fails, a toast is displayed with the error message as the description of the toast (and status 'error')
 *    - Once the player joins the game, the button dissapears
 *
 * - When the game ends, a toast is displayed with the result of the game:
 *    - Tie: description 'Game ended in a tie'
 *    - Our player won: description 'You won!'
 *    - Our player lost: description 'You lost :('
 *
 */
function PictionaryArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<PictionaryAreaController>(interactableID);
  const townController = useTownController();

  const [history, setHistory] = useState<GameResult[]>(gameAreaController.history);
  const [isPlayer, setIsPlayer] = useState<boolean>(gameAreaController.isPlayer);
  const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
  const [observers, setObservers] = useState<PlayerController[]>(gameAreaController.observers);
  const [joiningGame, setJoiningGame] = useState(false);
  const [drawer, setDrawer] = useState<PlayerController | undefined>(gameAreaController.drawer);
  const [currentWord, setCurrentWord] = useState<string>(gameAreaController.currentWord);
  const [timer, setTimer] = useState(gameAreaController.timer);
  const [betweenTurns, setBetweenTurns] = useState(gameAreaController.betweenTurns);
  const [guess, setGuess] = useState('');
  const toast = useToast();

  // TODO: Put these in a single point of control
  const turnLength = 30;
  const intermissionLength = 5;

  useEffect(() => {
    const updateGameState = () => {
      setHistory(gameAreaController.history);
      setIsPlayer(gameAreaController.isPlayer);
      setGameStatus(gameAreaController.status || 'WAITING_TO_START');
      setObservers(gameAreaController.observers);
      setDrawer(gameAreaController.drawer);
      setCurrentWord(gameAreaController.currentWord);
      setBetweenTurns(gameAreaController.betweenTurns);
      setTimer(gameAreaController.timer);
      console.log(`game state update, isPlayer: ${gameAreaController.isPlayer}`);
    };
    gameAreaController.addListener('gameUpdated', updateGameState);
    const onGameEnd = () => {
      const winner = gameAreaController.winner;
      if (!winner) {
        toast({
          title: 'Game over',
          description: 'Game ended in a tie',
          status: 'info',
        });
      } else if (winner === townController.ourPlayer) {
        toast({
          title: 'Game over',
          description: 'You won!',
          status: 'success',
        });
      } else {
        toast({
          title: 'Game over',
          description: `You lost :(`,
          status: 'error',
        });
      }
    };
    gameAreaController.addListener('gameEnd', onGameEnd);
    return () => {
      gameAreaController.removeListener('gameEnd', onGameEnd);
      gameAreaController.removeListener('gameUpdated', updateGameState);
    };
  }, [townController, gameAreaController, toast]);

  let gameStatusText = <></>;
  if (gameStatus === 'IN_PROGRESS') {
    gameStatusText = (
      <>
        Game in progress, currently{' '}
        {drawer === townController.ourPlayer ? 'your' : drawer?.userName + "'s"} turn
      </>
    );
  } else {
    let gameButton = <></>;
    if (
      (gameAreaController.status === 'WAITING_TO_START' && !isPlayer) ||
      gameAreaController.status === 'OVER'
    ) {
      gameButton = (
        <Button
          onClick={async () => {
            setJoiningGame(true);
            try {
              await gameAreaController.joinGame();
            } catch (err) {
              toast({
                title: 'Error joining game',
                description: (err as Error).toString(),
                status: 'error',
              });
            }
            setJoiningGame(false);
          }}
          isLoading={joiningGame}
          disabled={joiningGame}>
          Join New Game
        </Button>
      );
    } else if (gameAreaController.status === 'WAITING_TO_START' && isPlayer) {
      gameButton = <Button
        disabled={gameAreaController.players.length < 2}
        onClick={async () => {
          try {
            await gameAreaController.startGame();
          } catch (e) {
            toast({
              title: 'Error starting game',
              description: (e as Error).toString(),
              status: 'error',
            });
          }
        }}>
        Start
      </Button>
    }
    gameStatusText = (
      <b>
        Game {gameStatus === 'WAITING_TO_START' ? 'not yet started' : 'over'}. {gameButton}
      </b>
    );
  }

  function GuessInputs(): JSX.Element {
    return (
      <Flex direction={'column'}>
          <Input
            placeholder='Type your guess here'
            value={guess}
            onChange={event => setGuess(event.target.value)}
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
    );
  }

  function CurrentWordDisplay(): JSX.Element {
    return (
      <Container>
        <Heading as='h4' size='md'>{betweenTurns ? 'The word was:' : 'Your word:'}</Heading>
        {currentWord}
      </Container>
    );
  }

  //to use it:  {EndGameScore(gameAreaController.scores)};
  function EndGameScore({ scores }: { scores: Record<PlayerID, number> | undefined}): JSX.Element {
    return (
      <Container>
        <Heading as='h4' size='md'>Scores:</Heading>
        {scores ? (
          <UnorderedList>
            {(Object.entries(scores) as [PlayerID, number][]).map(([playerID, score]) => (
              <ListItem key={playerID}>{`Player ${playerID}: ${score}`}</ListItem>
            ))}
          </UnorderedList>
        ) : (
          <p>No scores available</p>
        )}
      </Container>
    );
  };

  function TimerDisplay(): JSX.Element {
    return (
      <div>
        {
          betweenTurns
          ? `Next turn in ${intermissionLength - timer} seconds`
          : `${turnLength - timer} seconds remaining`
        }
      </div>
    );
  }

  // Dispalys all info needed for testing pictionary game
  function TestingInfo(): JSX.Element {
    return (
      <UnorderedList>
        <ListItem>Current Word: {currentWord}</ListItem>
        <ListItem>
          Guess box:
          <Input
            placeholder='Type your guess here'
            value={guess}
            onChange={event => setGuess(event.target.value)}
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
        </ListItem>
        <ListItem>
          Test start game:
          <Button
            onClick={async () => {
              try {
                await gameAreaController.startGame();
              } catch (e) {
                toast({
                  title: 'Error starting game',
                  description: (e as Error).toString(),
                  status: 'error',
                });
              }
            }}>
            Start
          </Button>
          <ListItem>
            BetweenTurns?: {betweenTurns ? 'true' : 'false'}, Timer: {timer}
          </ListItem>
        </ListItem>
        <ListItem><EndGameScore scores={gameAreaController.scores} /></ListItem>
      </UnorderedList>
    )
  }

  function GameNotStartedScreen(): JSX.Element {
    return (
    <div>
      <Accordion allowToggle>
        <AccordionItem>
          <Heading as='h3'>
            <AccordionButton>
              <Box as='span' flex='1' textAlign='left'>
                Leaderboard
                <AccordionIcon />
              </Box>
            </AccordionButton>
          </Heading>
        </AccordionItem>
        <AccordionItem>
          <Heading as='h3'>
            <AccordionButton>
              <Box as='span' flex='1' textAlign='left'>
                Current Observers
                <AccordionIcon />
              </Box>
            </AccordionButton>
          </Heading>
          <AccordionPanel>
            <List aria-label='list of observers in the game'>
              {observers.map(player => {
                return <ListItem key={player.id}>{player.userName}</ListItem>;
              })}
            </List>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      {gameStatusText}
    </div>
  )};

  function PictionarySidebar(): JSX.Element {
    return (
      <VStack width={250} spacing='12' paddingTop={4}>
        {
          gameAreaController.isOurTurn || betweenTurns
          ? <CurrentWordDisplay />
          : <GuessInputs />
        }
        <EndGameScore scores={gameAreaController.scores}/>
      </VStack>
    );
  }

  const excalidraw = <Excalidraw />;
  function GameStartedScreen(): JSX.Element {
    return (
      <HStack h={'2xl'} w={['sm', '2xl', '6xl']} alignItems='top' margin={2}>
        {excalidraw}
        <PictionarySidebar />
      </HStack>
    );
  };

  return (
    <Container maxW={'fit-content'} maxH={'fit-content'}>
      {
        gameStatus === 'IN_PROGRESS'
        ? <GameStartedScreen />
        : <GameNotStartedScreen />
      }
    </Container>
  );
}

/**
 * A wrapper component for the PictionaryArea component.
 * Determines if the player is currently in a tic tac toe area on the map, and if so,
 * renders the PictionaryArea component in a modal.
 *
 */
export default function PictionaryAreaWrapper(): JSX.Element {
  const gameArea = useInteractable<GameAreaInteractable>('gameArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (gameArea) {
      townController.interactEnd(gameArea);
      const controller = townController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [townController, gameArea]);

  if (gameArea && gameArea.getData('type') === 'Pictionary') {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent maxW={'fit-content'} maxH={'fit-content'} marginTop={10}>
          <ModalHeader>{gameArea.name}</ModalHeader>
          <ModalCloseButton />
          <PictionaryArea interactableID={gameArea.name} />;
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
