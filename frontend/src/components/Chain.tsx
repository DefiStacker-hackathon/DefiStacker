import * as React from 'react';
const { useCallback, useEffect, useState } = React;
import { Row, Col } from 'antd';
import {
  // findIndex,
  Position,
} from '../utils/find-index';
// import move from 'array-move';
import { usePipeline } from '../context';
import { Block, BlockConnection, InitialBlock, Wallet, Submit } from '.';
import { getAdapters } from '../lib/pipeline';

const { useRef } = React;

const styles = {
  container: {
    marginTop: '20px',
    width: '100%',
  },
};

const Chain = () => {
  const [state, dispatch] = usePipeline();
  const [blocks, setBlocks] = useState([]);

  // We need to collect an array of height and position data for all of this component's
  // `Item` children, so we can later us that in calculations to decide when a dragging
  // `Item` should swap places with its siblings.
  const positions = useRef<Position[]>([]).current;
  const setPosition = (i: number, offset: Position) => (positions[i] = offset);

  // Find the ideal index for a dragging item based on its position in the array, and its
  // current drag offset. If it's different to its current index, we swap this item with that
  // sibling.

  const moveItem = useCallback(
    (i: number, dragOffset: number) => {
      // const targetIndex = findIndex(i, dragOffset, positions);
      // console.log(i, targetIndex, blocks, move(blocks, i, targetIndex));s
      // if (targetIndex !== i) setBlocks(move(blocks, i, targetIndex));
    },
    [blocks],
  );

  useEffect(() => {
    ((): void => {
      console.log('called');
      if (state.pipeline == null) return;
      const adapters = getAdapters(state.pipeline);
      if (adapters.length === 0) {
        setBlocks([<InitialBlock key={'initial-block'} />]);
        return;
      }
      setBlocks([
        ...adapters
          .map(({ id, adapter }, i) => {
            return [
              <Block
                id={id}
                key={id}
                adapter={adapter}
                i={i}
                color={'#AAA'}
                setPosition={setPosition}
                moveItem={moveItem}
              />,
              <BlockConnection key={`${id}-block-connection`} />,
            ];
          })
          .flat(),
      ]);
    })();
  }, [state]);

  return (
    <Row style={styles.container} justify="center">
      <Col span={9}>
        <Row align="middle" justify="center" style={{ height: '100%' }}>
          <Wallet />
        </Row>
      </Col>
      <Col span={6}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {blocks}
        </div>
      </Col>
      <Col span={9}>
        <Row align="middle" justify="center" style={{ height: '100%' }}>
          <Submit />
        </Row>
      </Col>
    </Row>
  );
};

export { Chain };
