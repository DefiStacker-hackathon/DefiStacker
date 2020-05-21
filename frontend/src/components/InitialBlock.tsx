import * as React from 'react';
import { Button, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { usePipelineDispatch } from '../context';
import { CaretRightOutlined } from '@ant-design/icons';

const ButtonStyle: React.CSSProperties = { height: '100px', width: '300px' };
const IconStyle: React.CSSProperties = { fontSize: '30px' };
const TooltipContainerStyle: React.CSSProperties = {
  position: 'absolute',
  left: -350,
  top: 40,
};
const RelativeContainerStyle: React.CSSProperties = { position: 'relative' };

const InitialBlock: React.FC = () => {
  const dispatch = usePipelineDispatch();
  return (
    <div style={RelativeContainerStyle}>
      <Button
        type="dashed"
        style={ButtonStyle}
        onClick={() => dispatch({ type: 'add_blank' })}
      >
        <PlusOutlined style={IconStyle} />
      </Button>
      <div style={TooltipContainerStyle}>
        <Row align="middle" gutter={10}>
          <Col>
            <div>Get started by adding your first building block</div>
          </Col>
          <Col>
            <CaretRightOutlined />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export { InitialBlock };
