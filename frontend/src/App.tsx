import * as React from 'react';
import { Layout, Row, Col } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';
const { Header, Content, Footer } = Layout;
import { Chain, InitialBlock } from './components';

// To see with empty state use the following:
// const mockBlocks: string[] = [];

// To see with state use the following:
const mockBlocks: string[] = ['#FF008C', '#D309E1', '#9C1AFF', '#7700FF'];

const App: React.FC = () => (
  <Layout className="layout">
    <Header>
      <Row gutter={10}>
        <Col>
          <ApartmentOutlined style={{ marginTop: '10px', fontSize: '40px' }} />
        </Col>
        <Col>
          <div style={{ fontSize: '26px', fontWeight: 700 }}>DeFi Stacker</div>
        </Col>
      </Row>
    </Header>
    <Content style={{ padding: '0 50px' }}>
      <Row justify="center">
        {mockBlocks.length === 0 ? (
          <InitialBlock />
        ) : (
          <Chain blocks={mockBlocks} />
        )}
      </Row>
    </Content>
    <Footer style={{ textAlign: 'center' }}>DeFi Stacker ©2020</Footer>
  </Layout>
);

export { App };
