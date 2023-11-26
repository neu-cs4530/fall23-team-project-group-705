import { Container, Heading, UnorderedList, ListItem } from '@chakra-ui/react';
import { PlayerID } from '../../../../generated/client';
import React from 'react';

function EndGameScore({ scores }: { scores: Record<PlayerID, number> | undefined }): JSX.Element {
  return (
    <Container>
      <Heading as='h4' size='md'>
        Scores:
      </Heading>
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
}
export default EndGameScore;
