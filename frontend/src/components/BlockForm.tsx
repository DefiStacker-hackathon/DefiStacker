import * as React from 'react';
import { Row, Button, Card, Col } from 'antd';
import { Formik } from 'formik';
import { Adapter } from '../lib/adapters/adapter';
import { takeFlashLoan, payBackFlashLoan } from '../lib/adapters/aave';
import { swapKyber } from '../lib/adapters/kyber';
import { swapUniswap } from '../lib/adapters/uniswap';
import { AdapterMethod, AdapterKind } from '../lib/adapters/adapter';
import { LeftOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { usePipelineDispatch } from '../context';

interface AdapterMethods {
  [elemName: string]: AdapterMethod;
}
const methods: AdapterMethods = {
  takeFlashLoan,
  payBackFlashLoan,
  swapKyber,
  swapUniswap,
};

interface FormValues {
  step: number;
  kind: AdapterKind;
  method: string;
  [key: string]: any;
}

const BlockForm = ({
  id,
  adapter,
  isHovering,
}: {
  id: number;
  adapter: Adapter;
  isHovering: boolean;
}) => {
  const dispatch = usePipelineDispatch();
  const initialValues: FormValues = {
    step: 1,
    kind: adapter.kind,
    method: String(adapter.method),
  };
  return (
    <Card style={{ backgroundColor: '#EEE', position: 'relative' }}>
      {isHovering && (
        <Button
          style={{
            position: 'absolute',
            right: 3,
            top: 3,
          }}
          ghost
          icon={<DeleteOutlined />}
          size="small"
          type="primary"
          onClick={() => dispatch({ type: 'delete', id })}
          danger
        />
      )}
      <Formik
        initialValues={initialValues}
        //   validate={(values) => {
        //     const errors = { email: "" };
        //     if (!values.email) {
        //       errors.email = "Required";
        //     } else if (
        //       !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
        //     ) {
        //       errors.email = "Invalid email address";
        //     }
        //     return errors;
        //   }}
        onSubmit={(values, { setSubmitting, setFieldValue }) => {
          const { kind, method, step, ...rest } = values;
          dispatch({
            type: 'update',
            id,
            kind: kind,
            method: methods[method],
            args: Object.entries(rest).flat(),
          });
          setSubmitting(false);
          setFieldValue('step', 3);
        }}
      >
        {({
          values,
          // errors,
          // touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setValues,
          setFieldValue,
          resetForm,
        }) => {
          const { step, kind, method, ...rest } = values;
          if (values.step === 1)
            return (
              <div style={{ position: 'relative' }}>
                <Row>
                  <Col>Aave</Col>
                </Row>
                {/* TODO: Could make the following more dynamic by generating from methods */}
                <Row gutter={10}>
                  <Col>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() =>
                        setValues({
                          step: 2,
                          method: 'takeFlashLoan',
                          kind: AdapterKind.AAVE,
                          ...Object.fromEntries(
                            methods['takeFlashLoan'].parameters.map((value) => [
                              value,
                              '',
                            ]),
                          ),
                        })
                      }
                    >
                      takeFlashLoan
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() =>
                        setValues({
                          step: 2,
                          method: 'payBackFlashLoan',
                          kind: AdapterKind.AAVE,
                          ...Object.fromEntries(
                            methods[
                              'payBackFlashLoan'
                            ].parameters.map((value) => [value, '']),
                          ),
                        })
                      }
                    >
                      payBackFlashLoan
                    </Button>
                  </Col>
                </Row>
                <Row style={{ width: '100%' }}>
                  <Col>Kyber</Col>
                </Row>
                <Row gutter={10}>
                  <Col>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() =>
                        setValues({
                          step: 2,
                          method: 'swapKyber',
                          kind: AdapterKind.KYBER,
                          ...Object.fromEntries(
                            methods['swapKyber'].parameters.map((value) => [
                              value,
                              '',
                            ]),
                          ),
                        })
                      }
                    >
                      swap
                    </Button>
                  </Col>
                </Row>
                <Row style={{ width: '100%' }}>
                  <Col>Uniswap</Col>
                </Row>
                <Row gutter={10}>
                  <Col>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() =>
                        setValues({
                          step: 2,
                          method: 'swapUniswap',
                          kind: AdapterKind.UNISWAP_1,
                          ...Object.fromEntries(
                            methods['swapUniswap'].parameters.map((value) => [
                              value,
                              '',
                            ]),
                          ),
                        })
                      }
                    >
                      swap
                    </Button>
                  </Col>
                </Row>
                {/* 
                // TODO: Add once Maker is finished
                <Row>MakerDAO</Row>
                <Row gutter={10}>
                  <Col>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() =>
                        setValues({ step: 2, method: '??',  method: AdapterKind.MAKER  })
                      }
                    >
                      ???
                    </Button>
                  </Col>
                </Row> */}
              </div>
            );
          if (values.step === 2)
            return (
              <form style={{ padding: '5px' }}>
                <Button
                  style={{
                    position: 'absolute',
                    left: 3,
                    top: 3,
                  }}
                  ghost
                  icon={<LeftOutlined />}
                  size="small"
                  type="primary"
                  onClick={() => resetForm()}
                />
                <Row>{methods[values.method].description}</Row>
                {Object.keys(rest).map((parameter, i: number) => {
                  return (
                    <Row key={i}>
                      {parameter}
                      <input
                        type={parameter}
                        name={parameter}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values[parameter]}
                      />
                    </Row>
                  );
                })}
                {/* errors.password && touched.password && errors.password} */}
                <Button
                  block
                  type="primary"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit()}
                >
                  Submit
                </Button>
              </form>
            );
          return (
            <div>
              {isHovering && (
                <Button
                  style={{
                    position: 'absolute',
                    right: 30,
                    top: 3,
                  }}
                  ghost
                  icon={<EditOutlined />}
                  size="small"
                  type="primary"
                  onClick={() => setFieldValue('step', 2)}
                />
              )}
              {adapter.method.label}
              {adapter.args.map((arg, i) => {
                return (
                  <Row
                    key={`${arg}-${i}`}
                    justify={i % 1 === 0 ? 'center' : 'start'}
                  >
                    {arg}
                  </Row>
                );
              })}
            </div>
          );
        }}
      </Formik>
    </Card>
  );
};

export { BlockForm };
