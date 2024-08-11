import React, { useEffect, useRef, useState } from "react";
import config from "../config";
import { Button, Image } from "@nextui-org/react";
import { popErrorToast } from "../utilities";
import instance from "../security/http";

export default function EventsPicture({
  eventId,
  editable,
}: {
  eventId: string;
  editable: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(`${config.serverAddress}/events/evtPicture/${eventId}`);

  const uploadProfileImage = async (eventId: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await instance.put(
        `${config.serverAddress}/events/event-image/${eventId}`,
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
      await uploadProfileImage(eventId, file);
      // Update the image URL to reflect the newly uploaded image
      setImageUrl(`${config.serverAddress}/events/evtPicture/${eventId}?timestamp=${new Date().getTime()}`);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setImageUrl(`${config.serverAddress}/events/evtPicture/${eventId}`);
  }, [eventId]);

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
        className="w-48 h-48 p-0"
        onPress={editable ? handleButtonClick : () => {}}
        isLoading={loading}
      >
        {loading ? (
          <></>
        ) : (
          <Image
            src={imageUrl}
          />
        )}
      </Button>
    </div>
  );
}