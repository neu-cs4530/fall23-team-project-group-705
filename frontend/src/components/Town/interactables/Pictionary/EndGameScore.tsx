import { Container, Heading, UnorderedList, ListItem } from '@chakra-ui/react';
import { PlayerID } from '../../../../generated/client';
import { Player } from '../../../../types/CoveyTownSocket';
import React from 'react';

function EndGameScore({ scores, players }: { scores: Record<PlayerID, number> | undefined, players: Player[] }): JSX.Element {
  return (
    <Container>
      <Heading as='h4' size='md'>
        Scores:
      </Heading>
      {scores ? (
        <UnorderedList>
          {(Object.entries(scores) as [PlayerID, number][]).map(([playerID, score]) =>  {
            const player = players.find((player) => player.id === playerID);
            return (<ListItem key={playerID}>{`Player ${player ? player.userName : playerID}: ${score}`}</ListItem>);
          })}
        </UnorderedList>
      ) : (
        <p>No scores available</p>
      )}
    </Container>
  );
}
export default EndGameScore;
