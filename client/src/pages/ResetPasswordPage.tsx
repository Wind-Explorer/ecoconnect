import { useParams, useNavigate } from "react-router-dom";
import instance from "../security/http";
import config from "../config";
import { useEffect, useState } from "react";
import { Button, Card, CircularProgress } from "@nextui-org/react";
import EcoconnectFullLogo from "../components/EcoconnectFullLogo";
import NextUIFormikInput from "../components/NextUIFormikInput";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { popErrorToast, popToast } from "../utilities";

const validationSchema = Yup.object({
  password: Yup.string()
    .trim()
    .min(8, "Password must be at least 8 characters")
    .max(69, "Password must be at most 69 characters")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*[0-9]).{1,}$/,
      "Password must contain both letters and numbers"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), undefined], "Passwords do not match")
    .required("Confirm Password is required"),
});

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [validationResult, setValidationResult] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  const validateToken = () => {
    instance
      .get(`${config.serverAddress}/users/reset-password/${token}`)
      .then(() => {
        setValidationResult(true);
      })
      .catch(() => {
        setValidationResult(false);
      })
      .finally(() => {
        setPageLoading(false);
      });
  };

  useEffect(() => {
    validateToken();
  }, []);

  const handleSubmit = (values: any): void => {
    console.log("submitting");
    instance
      .post(`${config.serverAddress}/users/reset-password`, {
        token,
        password: values.password,
      })
      .then(() => {
        popToast("Success!", 1);
        navigate("/signin");
      })
      .catch((error) => {
        popErrorToast(error);
      });
  };

  return (
    <div className="absolute inset-0 p-8 w-full h-full flex flex-col justify-center">
      <div className="flex flex-row justify-center">
        {pageLoading && (
          <div>
            <CircularProgress label="Loading..." />
          </div>
        )}
        {!pageLoading && (
          <div className="flex flex-col gap-8 *:mx-auto">
            <Card className="max-w-[600px] w-full mx-auto">
              {validationResult && (
                <div className="flex flex-col gap-8 p-12 text-left">
                  <div className="flex flex-col gap-2">
                    <p className="text-3xl font-bold">Password Reset</p>
                    <p>Enter a new password below.</p>
                  </div>
                  <Formik
                    initialValues={{ password: "", confirmPassword: "" }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ isValid, dirty }) => (
                      <Form className="flex flex-col gap-8">
                        <NextUIFormikInput
                          label="New Password"
                          name="password"
                          type="password"
                          placeholder="Enter new password"
                          labelPlacement="outside"
                        />
                        <NextUIFormikInput
                          label="Confirm Password"
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm new password"
                          labelPlacement="outside"
                        />
                        <Button
                          type="submit"
                          color="primary"
                          size="lg"
                          isDisabled={!isValid || !dirty}
                        >
                          Confirm
                        </Button>
                      </Form>
                    )}
                  </Formik>
                </div>
              )}
              {!validationResult && (
                <div className="flex flex-col gap-8 p-12 *:mr-auto text-left">
                  <div className="flex flex-col gap-2">
                    <p className="text-3xl font-bold">
                      Reset portal has been closed.
                    </p>
                    <p>Please request for a password reset again.</p>
                  </div>
                </div>
              )}
            </Card>
            <div className="flex flex-row gap-4">
              <EcoconnectFullLogo />
              <p>·</p>
              <p className="opacity-50">
                © Copyright {new Date().getFullYear()}. All rights reserved.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
