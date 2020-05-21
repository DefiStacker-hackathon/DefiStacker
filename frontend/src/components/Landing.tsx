import * as React from 'react';
import { Row, Col, Button } from 'antd';
import { usePipelineDispatch } from '../context';

const Landing: React.FC = () => {
  const dispatch = usePipelineDispatch();

  return (
    <Row
      style={{
        height: '100%',
        width: '100%',
        paddingTop: '80px',
      }}
    >
      <Col span={12} style={{ minWidth: '400px' }} flex={1}>
        <Row justify="center">Welcome to DeFi Stacker! We do some stuff.</Row>
      </Col>
      <Col span={11} flex={1}>
        <Row justify="center" style={{ paddingBottom: '30px' }}>
          What would you like to do today?
        </Row>
        <Row justify="center">
          <Col>
            <Row justify="center">
              <Button size="large" type="primary">
                <Row>Liquidate a CDP</Row>
              </Button>
            </Row>
          </Col>
          <Col offset={1}>
            <Button size="large" type="primary">
              <Row>Recollateralize a loan</Row>
            </Button>
          </Col>
          <Col offset={1}>
            <Button
              size="large"
              type="primary"
              onClick={() => dispatch({ type: 'init' })}
            >
              <Row>Custom</Row>
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export { Landing };
