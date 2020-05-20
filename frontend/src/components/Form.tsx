import * as React from 'react';
import { Row, Button, Card } from 'antd';
import { Formik } from 'formik';
import { takeFlashLoan, payBackFlashLoan } from '../lib/adapters/aave';
import { AdapterMethod } from '../lib/adapters/adapter';

interface AdapterMethods {
  [elemName: string]: AdapterMethod;
}
const methods: AdapterMethods = {
  takeFlashLoan,
  payBackFlashLoan,
};

const Form: React.FC = () => {
  return (
    <Card>
      <Formik
        initialValues={{ step: 1, type: '' }}
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
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
            setSubmitting(false);
          }, 400);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setValues,
          /* and other goodies */
        }) => {
          if (values.step === 1) {
            return (
              <>
                <Row>
                  <Row>Aaave</Row>
                  <Row>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() =>
                        setValues({ step: 2, type: 'takeFlashLoan' })
                      }
                    >
                      takeFlashLoan
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() =>
                        setValues({ step: 2, type: 'payBackFlashLoan' })
                      }
                    >
                      payBackFlashLoan
                    </Button>
                  </Row>
                </Row>
                <Row>
                  <Row style={{ width: '100%' }}>Kyber</Row>
                  <Row>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => setValues({ step: 2, type: 'swap' })}
                    >
                      swap
                    </Button>
                  </Row>
                </Row>
                <Row>
                  <Row style={{ width: '100%' }}>Uniswap</Row>
                  <Row>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => setValues({ step: 2, type: 'swap' })}
                    >
                      swap
                    </Button>
                  </Row>
                </Row>
                <Row>
                  <Row>Compound</Row>
                  <Row>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() =>
                        setValues({ step: 2, type: 'takeFlashLoan' })
                      }
                    >
                      takeFlashLoan
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() =>
                        setValues({ step: 2, type: 'payBackFlashLoan' })
                      }
                    >
                      payBackFlashLoan
                    </Button>
                  </Row>
                </Row>
              </>
            );
          }
          return (
            <form onSubmit={handleSubmit}>
              <Row>{methods[values.type].label}</Row>
              <Row>{methods[values.type].description}</Row>
              {methods[values.type].parameters.map((parameter, i) => {
                return <Row key={i}>{parameter}</Row>;
              })}

              {/* <input
                type="email"
                name="email"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.email}
              />
              {errors.email && touched.email && errors.email}
              <input
                type="password"
                name="password"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.password}
              />
              {errors.password && touched.password && errors.password} */}
              <Button type="primary" disabled={isSubmitting}>
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
