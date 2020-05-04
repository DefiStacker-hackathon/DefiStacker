import * as React from "react";
import { version } from "antd";
import Context from "../context";
const ANTVersion: React.FC = () => {
  const context = React.useContext(Context);
  console.log(context.provider);
  return (
    <>
      <h1>antd version: {version}</h1>
      <h1>network url: {context.provider.connection.url}</h1>
    </>
  );
};

export { ANTVersion };
