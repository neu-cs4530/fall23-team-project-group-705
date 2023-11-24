import { Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, Heading, Box, List, ListItem } from "@chakra-ui/react";
import PlayerController from "../../../../classes/PlayerController";

function GameNotStartedScreen({gameStatusText}: {gameStatusText: JSX.Element}, {observers}: {observers: PlayerController[]}): JSX.Element {
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
  )}
  export default GameNotStartedScreen;