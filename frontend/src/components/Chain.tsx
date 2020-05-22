import * as React from 'react';
const { useEffect, useState, useRef } = React;
import { Row, Col } from 'antd';
import { findIndex, Position } from '../utils/find-index';
import move from 'array-move';
import { usePipelineState } from '../context';
import { Block, BlockEmpty, Wallet, Submit } from '.';
import { getAdapters } from '../lib/pipeline';
import { Adapter } from '../lib/adapters/adapter';

const ContainerStyle: React.CSSProperties = {
  marginTop: '20px',
  width: '100%',
};
const VerticalFlexStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};
const RowHeightStyle: React.CSSProperties = {
  height: '100%',
};

const Chain = () => {
  const state = usePipelineState();
  
  const [blocks, setBlocks]: [
    { id: number; adapter: Adapter }[] | null,
    React.Dispatch<any>,
  ] = useState(null);

  useEffect(() => {
    (async () => {
      if (state.pipeline == null) return;
      const adapters = getAdapters(state.pipeline);
      if (adapters.length === 0) {
        setBlocks([]);
        return;
      }
      setBlocks(adapters);
    })();
  }, [state]);

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
    if (targetIndex !== i) setBlocks(move(blocks, i, targetIndex));
  };

  return (
    <Row style={ContainerStyle} justify="center">
      <Col span={8}>
        <Row align="middle" justify="center" style={RowHeightStyle}>
          <Wallet />
        </Row>
      </Col>
      <Col span={8} style={VerticalFlexStyle}>
        {blocks && blocks.length ? (
          blocks.map(
            ({ id, adapter }: { id: number; adapter: Adapter }, i: number) => (
              <Block
                id={id}
                key={id}
                adapter={adapter}
                i={i}
                color={'#AAA'}
                setPosition={setPosition}
                moveItem={moveItem}
                chainLength={blocks.length}
                // TODO: This is a janky kludge. Clean this up for proper branching
                previous={i > 0 ? [blocks[i - 1].id] : []}
                next={i === blocks.length - 1 ? [] : [blocks[i + 1].id]}
              />
            ),
          )
        ) : (
          <BlockEmpty key={'initial-block'} />
        )}
      </Col>
      <Col span={8}>
        <Row align="middle" justify="center" style={RowHeightStyle}>
          <Submit />
        </Row>
      </Col>
    </Row>
  );
};

export { Chain };
