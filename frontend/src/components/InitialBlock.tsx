import * as React from 'React';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const style = {
  height: '100px',
  width: '300px',
  margin: '50px',
};

const InitialBlock = () => {
  return (
    <Button type="dashed" style={style}>
      <PlusOutlined style={{ fontSize: '30px' }} />
    </Button>
  );
};

export { InitialBlock };
