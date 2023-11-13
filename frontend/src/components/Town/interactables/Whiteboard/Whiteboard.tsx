import React from 'react';
import { Box } from '@chakra-ui/react';

import { Excalidraw } from '@excalidraw/excalidraw';

export default function Whiteboard() {
  return (
    <>
      <Box h={'xl'} w={['sm', 'xl', '6xl']}>
        <Excalidraw />
      </Box>
    </>
  );
}
