import React, { useRef, useState } from "react";
import config from "../config";
import { Button, Image } from "@nextui-org/react";
import { popErrorToast } from "../utilities";
import instance from "../security/http";

export default function UserProfilePicture({
  userId,
  editable,
}: {
  userId: string;
  editable: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const uploadProfileImage = async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await instance.put(
        `${config.serverAddress}/users/profile-image/${userId}`,
        formData
      );
      return response.data;
    } catch (error) {
      popErrorToast(error);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      uploadAndHandleSubmit(file);
    }
  };

  const uploadAndHandleSubmit = async (file: File) => {
    setLoading(true);
    try {
      await uploadProfileImage(userId, file);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        aria-label="profile image selector"
        ref={fileInputRef}
        className="hidden"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      <Button
        className="w-48 h-48 p-0 border-2 border-primary-500 shadow-primary-500 shadow-2xl"
        radius="full"
        onPress={editable ? handleButtonClick : () => {}}
        isLoading={loading}
      >
        {loading ? (
          <></>
        ) : (
          <Image
            src={`${config.serverAddress}/users/profile-image/${userId}`}
            radius="full"
          />
        )}
      </Button>
    </div>
  );
}
