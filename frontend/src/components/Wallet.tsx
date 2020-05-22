import * as React from 'react';
import { Button, Row, Col } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
// import { usePipelineState } from '../context';

const WalletContainerStyle: React.CSSProperties = {
  width: '200px',
  height: '100px',
};
const WalletIconStyle: React.CSSProperties = {
  fontSize: '30px',
};

const Wallet = () => {
  //   const state = usePipelineState();

  return (
    <Button type="dashed" style={WalletContainerStyle}>
      <Row justify="center">
        <Col>Add Wallet</Col>
      </Row>
      <Row justify="center">
        <Col>
          <WalletOutlined style={WalletIconStyle} />
        </Col>
      </Row>
    </Button>
  );
};

export { Wallet };
