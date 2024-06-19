import { Button, Checkbox, Input, Link } from "@nextui-org/react";
import { useState } from "react";

export default function App() {
  const [userAgreedToTermsAndServices, setUserAgreedToTermsAndServices] =
    useState(false);
  return (
    <div>
      <div className="flex flex-col p-4 gap-8 relative *:w-max">
        <h1 className="text-3xl font-bold ">ecoconnect</h1>
        <div className="flex flex-col gap-4">
          <Input
            label="First Name"
            labelPlacement="outside"
            placeholder="John"
          ></Input>
          <Input
            label="Last Name"
            labelPlacement="outside"
            placeholder="Doe"
          ></Input>
          <Input
            label="Email"
            labelPlacement="outside"
            placeholder="johndoe@email.com"
            type="email"
          ></Input>
          <Input
            label="Phone number"
            labelPlacement="outside"
            placeholder="XXXXXXXX"
            startContent={
              <p className="text-sm pr-2 border-r-2 border-neutral-700">+65</p>
            }
          ></Input>
          <Input
            label="New Password"
            labelPlacement="outside"
            placeholder=" "
            type="password"
          ></Input>
        </div>
        <Checkbox
          isSelected={userAgreedToTermsAndServices}
          onValueChange={setUserAgreedToTermsAndServices}
          aria-label="Terms and services agreement checkbox"
        >
          I have read and agreed to the <Link href="#">Terms and Services</Link>
        </Checkbox>
        <Button
          onSubmit={() => {
            console.log("Submitting...");
          }}
          color="primary"
          isDisabled={!userAgreedToTermsAndServices}
        >
          Sign up
        </Button>
      </div>
    </div>
  );
}
