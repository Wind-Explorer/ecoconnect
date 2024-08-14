import {
  Button,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import config from "../config";
import NextUIFormikInput from "./NextUIFormikInput";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "../icons";
import { checkTwoFactorStatus, popErrorToast, popToast } from "../utilities";
import { retrieveUserInformation } from "../security/users";
import instance from "../security/http";
import { useState } from "react";
import TwoFactorAuthenticationModule from "./TwoFactorAuthenticationModule";

const validationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .lowercase()
    .min(5)
    .max(69)
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .trim()
    .max(69, "Password must be at most 69 characters")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*[0-9]).{1,}$/,
      "Password contains only letters and numbers"
    )
    .required("Password is required"),
});

export default function SignInModule() {
  const navigate = useNavigate();

  const [twoFactorModal, setTwoFactorModal] = useState(false);
  const [userLoginInformation, setUserLoginInformation] = useState<any>();

  const initialValues = {
    email: "",
    password: "",
  };

  const proceedWithLogin = (values?: any) => {
    if (!values) {
      values = userLoginInformation;
    }
    console.log("proceeding with login: " + values.email);
    instance
      .post(config.serverAddress + "/users/login", {
        email: values.email,
        password: values.password,
      })
      .then((response) => {
        console.log("logging in");
        localStorage.setItem("accessToken", response.data.accessToken);
        retrieveUserInformation()
          .then((value) => {
            if (value.accountType == 2) {
              navigate("/admin");
            } else {
              window.location.reload();
            }
          })
          .catch(() => {
            navigate("/account-inaccessible");
          });
      })
      .catch((error) => {
        popErrorToast(error);
        setTwoFactorModal(false);
      });
  };

  const handleSubmit = (values: any): void => {
    setUserLoginInformation(values);
    checkTwoFactorStatus(values.email)
      .then((answer) => {
        if (answer) {
          setTwoFactorModal(true);
        } else {
          proceedWithLogin(values);
        }
      })
      .catch(() => {
        popToast("User not found!", 2);
      });
  };

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-1">
        <p className="text-4xl font-bold">Sign In</p>
        <p className="text-2xl">to ecoconnect</p>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isValid, dirty }) => (
          <Form className="flex flex-col gap-4">
            <NextUIFormikInput
              label="Email"
              name="email"
              type="email"
              placeholder="johndoe@email.com"
              labelPlacement="outside"
            />
            <div className="flex flex-col gap-2 w-full">
              <NextUIFormikInput
                label="Password"
                name="password"
                type="password"
                placeholder=" "
                labelPlacement="outside"
              />
              <Link
                className="hover:cursor-pointer w-max"
                size="sm"
                onPress={() => {
                  navigate("/forgot-password");
                }}
              >
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              color="primary"
              size="lg"
              className="mx-auto"
              isIconOnly
              isDisabled={!isValid || !dirty}
            >
              <ChevronLeftIcon />
            </Button>
          </Form>
        )}
      </Formik>
      <div className="w-full flex flex-col gap-2 *:mx-auto">
        <p>New here?</p>
        <Link
          onPress={() => {
            navigate("/signup");
          }}
        >
          Sign up
        </Link>
      </div>
      <Modal size="xl" isOpen={twoFactorModal} onOpenChange={setTwoFactorModal}>
        <ModalContent>
          <ModalHeader>Two-Factor Authentication</ModalHeader>
          <ModalBody>
            {userLoginInformation && (
              <TwoFactorAuthenticationModule
                email={userLoginInformation.email}
                onTwoFactorSuccess={proceedWithLogin}
              />
            )}
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
