import * as React from 'react';
import { version } from 'antd';
import Context from '../context';
import { useTestQueryQuery } from '../graphql/queries/testQuery.queries';

const ANTVersion: React.FC = () => {
  const context = React.useContext(Context);

  const [result, reexecuteQuery] = useTestQueryQuery({});
  const { data, fetching, error } = result;
  if (fetching) return <p>Loading...</p>;
  if (error) return <p>Oh no... {error.message}</p>;
  console.log(data);
  return (
    <>
      <h1>antd version: {version}</h1>
      <h1>network url: {context.provider.connection.url}</h1>
    </>
  );
};

export { ANTVersion };
