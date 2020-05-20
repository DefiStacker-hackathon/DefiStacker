import * as React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { usePipelineDispatch } from '../context';

const styles = {
  button: { height: '100px', width: '300px' },
  icon: { fontSize: '30px' },
};

const InitialBlock: React.FC = () => {
  const dispatch = usePipelineDispatch();
  return (
    <Button
      type="dashed"
      style={styles.button}
      onClick={() => dispatch({ type: 'add_blank' })}
    >
      <PlusOutlined style={styles.icon} />
    </Button>
  );
};

export { InitialBlock };
