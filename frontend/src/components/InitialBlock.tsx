import * as React from 'react';
import { Button, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { usePipelineDispatch } from '../context';
import { CaretRightOutlined } from '@ant-design/icons';

const ButtonStyle: React.CSSProperties = { height: '100px', width: '300px' };
const IconStyle: React.CSSProperties = { fontSize: '30px' };
const TooltipContainerStyle: React.CSSProperties = {
  position: 'absolute',
  left: -350,
  top: 40,
};
const RelativeContainerStyle: React.CSSProperties = { position: 'relative' };

const variants = {
  visible: {
    opacity: 100,
    transition: {
      ease: 'easeIn',
      duration: 5,
      staggerChildren: 1,
    },
  },
  hidden: {
    opacity: 0,
  },
};

const InitialBlock: React.FC = () => {
  const dispatch = usePipelineDispatch();
  return (
    <motion.div
      style={RelativeContainerStyle}
      initial="hidden"
      animate="visible"
      variants={variants}
    >
      <motion.div variants={variants}>
        <Button
          type="dashed"
          style={ButtonStyle}
          onClick={() => dispatch({ type: 'add_blank' })}
        >
          <PlusOutlined style={IconStyle} />
        </Button>
      </motion.div>
      <motion.div style={TooltipContainerStyle} variants={variants}>
        <Row align="middle" gutter={10}>
          <Col>
            <div>Get started by adding your first building block</div>
          </Col>
          <Col>
            <CaretRightOutlined />
          </Col>
        </Row>
      </motion.div>
    </motion.div>
  );
};

export { InitialBlock };
