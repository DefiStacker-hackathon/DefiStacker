import * as React from 'react';
import { Row, Col, Button } from 'antd';
import { usePipelineDispatch } from '../context';

const ColStyle: React.CSSProperties = {
  marginTop: '10px',
  marginBottom: '10px',
};

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
      <Col span={24} md={12}>
        <Row justify="center">Welcome to DeFi Stacker! We do some stuff.</Row>
      </Col>
      <Col span={24} md={12}>
        <Row justify="center" style={{ paddingBottom: '30px' }}>
          What would you like to do with DeFi today?
        </Row>
        <Row justify="center">
          <Col style={ColStyle}>
            <Row justify="center">
              <Button size="large" type="primary">
                <Row>Liquidate a CDP</Row>
              </Button>
            </Row>
          </Col>
          <Col offset={1} style={ColStyle}>
            <Button size="large" type="primary">
              <Row>Recollateralize a loan</Row>
            </Button>
          </Col>
          <Col offset={1} style={ColStyle}>
            <Button
              size="large"
              onClick={() => dispatch({ type: 'init' })}
              type="dashed"
            >
              <Row>Build my own transaction</Row>
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export { Landing };
