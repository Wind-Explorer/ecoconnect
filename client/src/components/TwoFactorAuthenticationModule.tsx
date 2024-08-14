import { useEffect, useRef, useState } from "react";
import AuthCode, { AuthCodeRef } from "react-auth-code-input";
import instance from "../security/http";
import { popErrorToast } from "../utilities";

export default function TwoFactorsAuthenticationModule({
  email,
  onTwoFactorSuccess,
}: {
  email: string;
  onTwoFactorSuccess: () => void;
}) {
  const AuthInputRef = useRef<AuthCodeRef>(null);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [twoFactorVerifying, setTwoFactorVerifying] = useState(false);
  useEffect(() => {
    if (!(twoFactorToken.length == 6 && !twoFactorVerifying)) {
      return;
    }

    setTwoFactorVerifying(true);
    instance
      .post("/users/verify-2fa", {
        email: email,
        token: twoFactorToken,
      })
      .then(() => {
        onTwoFactorSuccess();
      })
      .catch((error) => {
        popErrorToast(error);
        AuthInputRef.current?.clear();
        setTwoFactorToken("");
      })
      .finally(() => {
        AuthInputRef.current?.clear();
        setTwoFactorToken("");
        setTwoFactorVerifying(false);
      });
  }, [twoFactorToken]);
  return (
    <div className="text-center flex flex-col gap-4">
      <AuthCode
        containerClassName="flex flex-row gap-4 w-full justify-center"
        inputClassName="w-16 h-16 text-4xl text-center rounded-lg my-2 bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 "
        length={6}
        allowedCharacters="numeric"
        ref={AuthInputRef}
        disabled={twoFactorVerifying}
        onChange={(value) => {
          setTwoFactorToken(value);
        }}
      />
      <p className="text-md opacity-50">
        Please enter the 6 digits passcode from your authenticator app.
      </p>
    </div>
  );
}
