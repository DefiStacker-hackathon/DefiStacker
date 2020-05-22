import * as React from 'react';
const { useState, useEffect } = React;
import { Button } from 'antd';
import { usePipelineState } from '../context';

const Submit = () => {
  const [disabled, setDisabled] = useState(true);
  const state = usePipelineState();
  useEffect(() => {
    // TODO: Validate Pipeline to toggle disabled state
    if (false) setDisabled(false);
  }, [state]);

  return (
    <Button disabled={disabled} type={disabled ? 'dashed' : 'primary'}>
      Submit
    </Button>
  );
};

export { Submit };
