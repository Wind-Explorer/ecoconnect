import { retrieveUserInformation } from "../security/users";
import { useEffect, useState } from "react";
import { Button, Image, Input } from "@nextui-org/react";
import instance from "../security/http";
import { checkTwoFactorStatus } from "../utilities";
import TwoFactorAuthenticationModule from "./TwoFactorAuthenticationModule";

export default function TwoFactorsAuthenticationSetupModule({
  onClose,
}: {
  onClose: () => void;
}) {
  const [userInformation, setUserInformation] = useState<any>();
  const [setup2FAStepperCount, setSetup2FAStepperCount] = useState(0);
  const [disable2FAStepperCount, setDisable2FAStepperCount] = useState(0);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [setupQRBase64, setSetupQRBase64] = useState("");
  const [setupBase32Secret, setSetupBase32Secret] = useState("");

  const disableTwoFactor = async () => {
    instance
      .post("/users/disable-2fa", {
        id: userInformation.id,
      })
      .then(() => {
        setDisable2FAStepperCount(1);
      });
  };

  const enableTwoFactor = () => {
    instance
      .post("/users/enable-2fa/" + userInformation.id)
      .then((response) => {
        setSetupQRBase64(response.data.data.qrCodeUrl);
        setSetupBase32Secret(response.data.data.secret);
        setSetup2FAStepperCount(1);
      });
  };

  const testTwoFactor = () => {};

  useEffect(() => {
    retrieveUserInformation().then((response) => {
      setUserInformation(response);
      checkTwoFactorStatus(response.email).then((answer) => {
        setIsTwoFactorEnabled(answer);
      });
    });
  }, []);

  return (
    <div>
      {userInformation && (
        <>
          {!isTwoFactorEnabled && (
            <div>
              {setup2FAStepperCount === 0 && (
                <div className="flex flex-col gap-4">
                  <p>
                    This setup will guide you through the enabling of
                    Two-Factors Authorization (2FA).
                  </p>
                  <Button
                    onPress={() => {
                      enableTwoFactor();
                    }}
                  >
                    Continue
                  </Button>
                </div>
              )}
              {setup2FAStepperCount === 1 && (
                <div className="flex flex-col gap-4">
                  <p>
                    Please scan the QR code below using an authenticator app of
                    your choice.
                  </p>
                  {setupQRBase64 && (
                    <Image src={setupQRBase64} alt="2FA SETUP QR" />
                  )}
                  <p>Or alternatively, manually enter the secret in the app:</p>
                  <Input value={setupBase32Secret} readOnly />
                  <div className="w-full flex flex-row justify-end">
                    <Button
                      onPress={() => {
                        setSetup2FAStepperCount(2);
                      }}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
              {setup2FAStepperCount === 2 && (
                <div className="flex flex-col gap-4">
                  <p>Let's give it a try.</p>
                  <TwoFactorAuthenticationModule
                    email={userInformation.email}
                    onTwoFactorSuccess={() => {
                      setSetup2FAStepperCount(3);
                    }}
                  />
                  <div className="w-full flex flex-row justify-end">
                    <Button
                      variant="light"
                      onPress={() => {
                        setSetup2FAStepperCount(3);
                      }}
                    >
                      Skip
                    </Button>
                    <Button
                      onPress={() => {
                        enableTwoFactor();
                      }}
                    >
                      Setup again
                    </Button>
                  </div>
                </div>
              )}
              {setup2FAStepperCount === 3 && (
                <div className="flex flex-col gap-4">
                  <p>
                    All set! You will be asked to provide the passcode next time
                    you log in.
                  </p>
                  <div className="w-full flex flex-row justify-end">
                    <Button onPress={onClose}>Finish</Button>
                  </div>
                </div>
              )}
            </div>
          )}
          {isTwoFactorEnabled && (
            <div>
              {disable2FAStepperCount === 0 && (
                <div className="flex flex-col gap-4 w-full">
                  <p>
                    Are you sure you want to disable Two-Factors Authorization
                    (2FA)?
                  </p>
                  <div className="flex flex-row gap-2 w-full justify-end">
                    <Button
                      variant="light"
                      color="danger"
                      onPress={() => {
                        disableTwoFactor();
                      }}
                    >
                      Confirm
                    </Button>
                    <Button color="primary" onPress={onClose}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {disable2FAStepperCount === 1 && (
                <div className="flex flex-col gap-4 w-full">
                  <p>2FA has been disabled.</p>
                  <div className="w-full flex flex-row justify-end">
                    <Button onPress={onClose}>Finish</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
