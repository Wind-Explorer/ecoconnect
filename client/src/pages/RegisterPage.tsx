import React from "react";
import { useParams } from "react-router-dom";
import { Button } from "@nextui-org/react";

const RegisterPage = () => {
  const { id } = useParams<{ id: string }>();

  const handleRegister = () => {
    // Add logic for registration here, if needed
    console.log(`Registered for event with ID: ${id}`);
  };

  return (
    <div className="w-full h-full p-8">
      <h1 className="text-2xl font-bold mb-4">Register for Event</h1>
      <Button
        className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600"
        onClick={handleRegister}
      >
        Register
      </Button>
    </div>
  );
};

export default RegisterPage;
