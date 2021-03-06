import * as React from 'react';
const { useEffect } = React;
import { Layout, Row, Col } from 'antd';
const { Header, Content, Footer } = Layout;
import { ApartmentOutlined } from '@ant-design/icons';
import { Chain, Landing } from './components';
import { usePipeline } from './context';
import { useSubgraphQuery } from './graphql/queries/subgraph.queries';

// TODO: move the following to styled-components
const FooterStyle: React.CSSProperties = { textAlign: 'center' };
const ContainerStyle: React.CSSProperties = {
  minHeight: '98vh',
  height: '100%',
  width: '100vw',
};
const ContentStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
};
const LogoStyle: React.CSSProperties = { marginTop: '10px', fontSize: '40px' };
const TitleStyle: React.CSSProperties = { fontSize: '26px', fontWeight: 700 };

const App: React.FC = () => {
  const [state, dispatch] = usePipeline();

  const [{ data }] = useSubgraphQuery();

  useEffect(() => {
    dispatch({
      type: 'connect',
    });
  }, []);

  useEffect(() => {
    if (data)
      dispatch({
        type: 'initContracts',
        data: data,
      });
  }, [data]);

  return (
    <Layout className="layout" style={ContainerStyle}>
      <Header>
        <Row gutter={10}>
          <Col>
            <ApartmentOutlined style={LogoStyle} />
          </Col>
          <Col>
            <div style={TitleStyle}>DeFi Stacker</div>
          </Col>
        </Row>
      </Header>
      <Content style={ContentStyle}>
        {state?.pipeline === null ? <Landing /> : <Chain />}
      </Content>
      <Footer style={FooterStyle}>DeFi Stacker ©2020</Footer>
    </Layout>
  );
};

export { App };
