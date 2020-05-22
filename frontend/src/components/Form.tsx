import * as React from 'react';
import { Row, Button, Card, Col } from 'antd';
import { Formik } from 'formik';
import { takeFlashLoan, payBackFlashLoan } from '../lib/adapters/aave';
import { AdapterMethod, AdapterKind } from '../lib/adapters/adapter';
import { LeftOutlined } from '@ant-design/icons';
import { usePipelineDispatch } from '../context';

interface AdapterMethods {
  [elemName: string]: AdapterMethod;
}
const methods: AdapterMethods = {
  takeFlashLoan,
  payBackFlashLoan,
  // TODO: Add rest of methods
};

interface FormValues {
  step: number;
  kind: AdapterKind;
  method: string;
}
const initialValues: FormValues = {
  step: 1,
  kind: AdapterKind.NULL,
  method: '',
};

const Form = ({ i, id }: { i: number; id: number }) => {
  const dispatch = usePipelineDispatch();
  return (
    <Card style={{ backgroundColor: '#EEE' }}>
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
        onSubmit={(values, { setSubmitting }) => {
          const { kind, method, step, ...rest } = values;
          // const args: any[] = [...rest];
          dispatch({
            type: 'update',
            id,
            kind: kind,
            method: methods[method],
            // TODO: hook up args
            args: [],
          });
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
        }) => {
          if (values.step === 1) {
            return (
              <div style={{ position: 'relative' }}>
                <Row>
                  <Col>Aave</Col>
                </Row>
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
                          method: 'swap',
                          kind: AdapterKind.KYBER,
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
                          method: 'swap',
                          kind: AdapterKind.UNISWAP_1,
                        })
                      }
                    >
                      swap
                    </Button>
                  </Col>
                </Row>
                {/* 
                // TODO: Add once compound is finished
                <Row>Compound</Row>
                <Row gutter={10}>
                  <Col>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() =>
                        setValues({ step: 2, method: '??',  method: AdapterKind.COMPOUND  })
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
                        setValues({ step: 2, method: '??', method: AdapterKind.COMPOUND })
                      }
                    >
                      payBackFlashLoan
                    </Button>
                  </Col>
                </Row> */}
              </div>
            );
          }
          return (
            <form style={{ padding: '5px' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 3,
                  top: 3,
                }}
              >
                <Button
                  ghost
                  icon={<LeftOutlined />}
                  size="small"
                  type="primary"
                  onClick={() => setFieldValue('step', 1)}
                />
              </div>
              <Row>{methods[values.method].label}</Row>
              <Row>{methods[values.method].description}</Row>
              {methods[values.method].parameters.map((parameter, i) => {
                return (
                  <Row key={i}>
                    {/* <input
                      type={parameter}
                      name={parameter}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values[parameter]}
                    /> */}
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
        }}
      </Formik>
    </Card>
  );
};

export { Form };
