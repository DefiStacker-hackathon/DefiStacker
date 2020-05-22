import * as React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { usePipelineDispatch } from '../context';

const ArrowContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: 3.5,
};
const ArrowLineStyle: React.CSSProperties = {
  borderRight: ' 0.2rem dashed red',
  display: 'inline-block',
  height: '5rem',
};
const ArrowHeadStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 4,
  height: '1rem',
  borderRight: '0.2rem solid red',
  display: 'inline-block',
};
const ArrowHeadRightStyle: React.CSSProperties = {
  ...ArrowHeadStyle,
  right: '0.3rem',
  transform: 'rotate(-45deg)',
};
const ArrowHeadLeftStyle: React.CSSProperties = {
  ...ArrowHeadStyle,
  right: '-0.32rem',
  transform: 'rotate(45deg)',
};

const BlockConnection = ({
  id,
  previous,
  next,
  isHovering,
}: {
  id: number;
  previous: number[];
  next: number[];
  isHovering: boolean;
}) => {
  const dispatch = usePipelineDispatch();
  return (
    <div style={ArrowContainerStyle}>
      <span style={ArrowHeadRightStyle}></span>
      <span style={ArrowLineStyle}></span>
      {isHovering && (
        <span style={{ position: 'absolute', left: '20px', top: '22%' }}>
          <Button
            danger
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            onClick={() => 
              dispatch({ type: 'add_blank', incoming: [id], outgoing: next })
            }
          />
        </span>
      )}
      <span style={ArrowHeadLeftStyle}></span>
    </div>
  );
};

export { BlockConnection };
