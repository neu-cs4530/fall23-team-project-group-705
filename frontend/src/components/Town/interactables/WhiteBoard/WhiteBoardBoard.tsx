import { Button, chakra, Container, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';

export default function App() {
  return (
    <>
      <h1 style={{ textAlign: 'center' }}>White Board</h1>
      <div style={{ height: '500px' }}>
        <Excalidraw />
      </div>
    </>
  );
}
