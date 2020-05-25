import * as React from 'react';
import { Button, Row, Col, Input, Select } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { usePipelineDispatch } from '../context';
import { usePipelineState } from '../context';
import { useSubgraphQuery } from '../graphql/queries/subgraph.queries';
import * as addresses from '../lib/addresses';

const { Option } = Select;

const WalletContainerStyle: React.CSSProperties = {
  width: '200px',
  height: '100px',
};
const WalletIconStyle: React.CSSProperties = {
  fontSize: '30px',
};

const Wallet = () => {
  const [tokenSymbol, setTokenSymbol] = React.useState("DAI");
  const [showInput, setShowInput] = React.useState(false);
  const state = usePipelineState();
  const dispatch = usePipelineDispatch();
  const inputRef = React.useRef(null);
  const selectorRef = React.useRef(null);

  const selectBefore = (
    <Select defaultValue="DAI" className="select-before" ref={selectorRef} onChange={handleChange}>
      <Option value="DAI">DAI</Option>
      <Option value="ETH">ETH</Option>
    </Select>
  );

  const approveButton = (
    <div onClick={addFunds}>Approve</div>
  );

  function handleChange(obj: any) {
    setTokenSymbol(obj.value);
  }

  function addFunds() {
    const amountInWei = inputRef.current.input.value;
    dispatch({
      type: "approve",
      tokenSymbol: tokenSymbol,
      amountInWei: amountInWei,
      // TODO
      stackerAddress: "",
    });
  }

  function start() {
    dispatch({ type: "init" });
    setShowInput(true);
  }

  function getDai() {
    console.log("get dai");
    dispatch({ type: "get_dai"});
  }

  function renderWalletButton() {
    return (
    <Button type="dashed" style={WalletContainerStyle} onClick={start}>
      <Row justify="center">
        <Col>Add Funds</Col>
      </Row>
      <Row justify="center">
        <Col>
          <WalletOutlined style={WalletIconStyle} />
        </Col>
      </Row>
    </Button>
    );
  }

  function renderInput() {
    return (
    <Input
      ref={inputRef}
      addonBefore={selectBefore}
      addonAfter={approveButton}
      placeholder="Enter an amount"
      prefix={"tokenIcon"}
    />
    );
  }

  function burnTest() {
    dispatch({ type: "send_eth", to: addresses.ZERO_ADDRESS, amountInEth: "1" });
  }

  return (
    <div>
      <Button onClick={burnTest}>Burn Test</Button>
      <Button onClick={getDai}>Get DAI</Button>
      {!showInput && renderWalletButton()}
      {showInput && renderInput()}
    </div>
  );
};

export { Wallet };
