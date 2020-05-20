import * as React from 'react';
const { useMemo } = React;
import { Row } from 'antd';
// import { findIndex, Position } from '../utils/find-index';
// import move from 'array-move';
import { usePipeline } from '../context';
import { Block, InitialBlock } from '.';
import { getAdapters } from '../lib/pipeline';

// const { useRef, useEffect } = React;

const styles = {
  container: {
    marginTop: '20px',
  },
};

const Chain = () => {
  const [state, dispatch] = usePipeline();

  // useEffect(() => {
  //   dispatch({ type: 'add' });
  // }, []);

  const blocks = useMemo(() => {
    if (!state.pipeline) return [];
    const adapters = getAdapters(state.pipeline);
    if (adapters.length === 0) return <InitialBlock />;
    return (
      <ul>
        {adapters.map(({ id, adapter }, i) => {
          return (
            <Block
              key={id}
              adapter={adapter}
              i={i}
              color={'#AAA'}
              setPosition={() => {}}
              moveItem={() => {}}
            />
          );
        })}
      </ul>
    );
  }, [state]);

  // We need to collect an array of height and position data for all of this component's
  // `Item` children, so we can later us that in calculations to decide when a dragging
  // `Item` should swap places with its siblings.
  // const positions = useRef<Position[]>([]).current;
  // const setPosition = (i: number, offset: Position) => (positions[i] = offset);

  // Find the ideal index for a dragging item based on its position in the array, and its
  // current drag offset. If it's different to its current index, we swap this item with that
  // sibling.
  // const moveItem = (i: number, dragOffset: number) => {
  //   const targetIndex = findIndex(i, dragOffset, positions);
  //   if (targetIndex !== i) setColors(move(colors, i, targetIndex));
  // };

  return (
    <Row style={styles.container} justify="center">
      {blocks}
    </Row>
  );
};

export { Chain };
