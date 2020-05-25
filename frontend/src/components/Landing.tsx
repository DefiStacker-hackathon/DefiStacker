import * as React from 'react';
import { Row, Col, Button } from 'antd';
import { usePipelineDispatch } from '../context';

const ColStyle: React.CSSProperties = {
  marginTop: '10px',
  marginBottom: '10px',
};
const RowStyle: React.CSSProperties = { paddingBottom: '30px' };

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
        <Row justify="center">
          <h1>Welcome to DeFi Stacker!</h1>
        </Row>
        <Row justify="center">
          <p>Stack your money like legos.</p>
        </Row>
      </Col>
      <Col span={24} md={12}>
        <Row justify="center" style={RowStyle}>
          <h1>What would you like to do with DeFi today?</h1>
        </Row>
        <Row justify="center" style={RowStyle}>
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
              onClick={() => dispatch({ type: 'initBlankPipeline' })}
            >
              <Row>Build my own transaction</Row>
            </Button>
          </Col>
        </Row>
        <Row justify="center" style={{ ...RowStyle, marginTop: '80px' }}>
          <h2>Saved templates:</h2>
        </Row>
        <Row justify="center" style={RowStyle}>
          <Button size="large" type="dashed" disabled>
            <Row>Coming Soon!</Row>
          </Button>
        </Row>
      </Col>
    </Row>
  );
};

export { Landing };
