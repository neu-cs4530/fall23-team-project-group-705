import React from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';

export default function WhiteBoardBoard() {
  return (
    <>
      <h1 style={{ textAlign: 'center' }}>White Board</h1>
      <div style={{ height: '1000px', width: '1200px' }}>
        <Excalidraw />
      </div>
    </>
  );
}
