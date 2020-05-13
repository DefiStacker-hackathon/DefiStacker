import * as React from 'react';
import { Block } from '.';
import { findIndex, Position } from '../utils/find-index';
import move from 'array-move';

const { useState, useRef } = React;

export const Chain = ({ blocks }: { blocks: string[] }) => {
  const [colors, setColors] = useState(blocks);

  // We need to collect an array of height and position data for all of this component's
  // `Item` children, so we can later us that in calculations to decide when a dragging
  // `Item` should swap places with its siblings.
  const positions = useRef<Position[]>([]).current;
  const setPosition = (i: number, offset: Position) => (positions[i] = offset);

  // Find the ideal index for a dragging item based on its position in the array, and its
  // current drag offset. If it's different to its current index, we swap this item with that
  // sibling.
  const moveItem = (i: number, dragOffset: number) => {
    const targetIndex = findIndex(i, dragOffset, positions);
    if (targetIndex !== i) setColors(move(colors, i, targetIndex));
  };

  return (
    <ul>
      {colors.map((color, i) => (
        <Block
          key={color}
          i={i}
          color={color}
          setPosition={setPosition}
          moveItem={moveItem}
        />
      ))}
    </ul>
  );
};
