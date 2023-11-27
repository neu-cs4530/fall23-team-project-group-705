import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Heading,
  Box,
  List,
  ListItem,
} from '@chakra-ui/react';
import PlayerController from '../../../../classes/PlayerController';
import React, { useEffect, useState } from 'react';
import PictionaryAreaController from '../../../../classes/interactable/PictionaryAreaController';
import { GameResult } from '../../../../types/CoveyTownSocket';
import Leaderboard from '../Leaderboard';

function GameNotStartedScreen(props: {
  gameAreaController: PictionaryAreaController;
  gameStatusText: JSX.Element;
  observers: PlayerController[];
}): JSX.Element {
  const gameStatusText: JSX.Element = props.gameStatusText;
  const observers: PlayerController[] = props.observers;
  const gameAreaController: PictionaryAreaController = props.gameAreaController;
  const [history, setHistory] = useState<GameResult[]>(gameAreaController.history);

  useEffect(() => {
    setHistory(gameAreaController.history);
  }, []);

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
          <AccordionPanel>
            <Leaderboard results={history} />
          </AccordionPanel>
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
  );
}
export default GameNotStartedScreen;
