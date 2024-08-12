import { Button, Card, Link } from "@nextui-org/react";
import { LockClosedIcon } from "../icons";
import { useNavigate } from "react-router-dom";

export default function AccoutnInaccessiblePage() {
  const navigate = useNavigate();
  return (
    <div className=" flex flex-col gap-4">
      <div className="flex flex-col m-8 gap-8">
        <div className="rounded-xl flex flex-col gap-8 p-4 justify-center bg-primary-500 text-center text-white">
          <div className="pt-10 w-full flex flex-row justify-center scale-150">
            <div className="scale-150 pb-2">
              <LockClosedIcon />
            </div>
          </div>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <p className="text-4xl font-bold">Account unavailable.</p>
              <p className="text-xl opacity-70">
                The access to this account has been revoked.
              </p>
            </div>
            <p>
              If you wish to recover the account, please{" "}
              <Link
                className="text-white px-1 rounded-md bg-primary-400"
                onPress={() => {
                  window.location.href = "mailto:support@ecoconnect.gov.sg";
                }}
              >
                contact us
              </Link>
            </p>
            <div className="w-min mx-auto"></div>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="w-min mx-auto">
            <Button size="lg" onPress={() => navigate("/signin")}>
              Sign in with a different account
            </Button>
          </div>
        </div>
      </div>
      <div className="p-8 flex flex-col gap-4">
        <p className="text-2xl font-semibold">Why am I seeing this?</p>
        <div className="flex flex-col gap-2">
          <p>
            You have attempted to access an account that has been marked as
            inactive.
          </p>
          <p>
            This may due to, either manual operation by the owner of the
            account, or administrative decision from the management team.
          </p>
          <p>
            The information related to this account remains, however the access
            to the account will not be available.
          </p>
          <p>
            If you believe that this is incorrect, or would like to request a
            re-activation, please{" "}
            <Link
              onPress={() => {
                window.location.href = "mailto:support@ecoconnect.gov.sg";
              }}
            >
              contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
