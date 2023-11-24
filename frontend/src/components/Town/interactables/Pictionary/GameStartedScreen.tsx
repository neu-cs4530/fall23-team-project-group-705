import { HStack, VStack, Heading, Flex, Input, Button } from "@chakra-ui/react";

function GameStartedScreen(): JSX.Element {
  return (
    <HStack h={'2xl'} w={['sm', '2xl', '6xl']} alignItems='top' margin={2}>
      <Excalidraw />
      <VStack width={250} spacing='12' paddingTop={4}>
      <TimerDisplay gameAreaController={gameAreaController} />
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