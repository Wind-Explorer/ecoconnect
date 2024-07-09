import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { retrieveUserInformation } from "../security/users";
import { CircularProgress } from "@nextui-org/react";

export default function SignedInStatusVerifier({
  children,
}: {
  children: React.JSX.Element;
}) {
  let navigate = useNavigate();
  let [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    retrieveUserInformation()
      .then((value) => {
        if (value) navigate("/springboard");
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);
  return (
    <>
      {!isLoading && <>{children}</>}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col justify-center w-full h-full">
          <div className="flex flex-row justify-center w-full h-full">
            <CircularProgress
              aria-label="Trying to sign in..."
              label="Please wait..."
              size="lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
