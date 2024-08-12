import React, { useState } from "react";
import config from "../config";
import instance from "../security/http";
import { AxiosResponse } from "axios";
import { Card } from "@nextui-org/react";

interface InsertImageProps {
  label: string;
  onImageSelected: (file: File | null) => void;
  onAmountResolved: (amount: number) => void;
  onAiProcessingChange: React.Dispatch<React.SetStateAction<boolean>>;
}

const InsertBillImage: React.FC<InsertImageProps> = ({
  label,
  onImageSelected,
  onAmountResolved,
  onAiProcessingChange,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  const base64StringToChunks = (base64String: string): string[] => {
    const chunks: string[] = [];
    const chunkSize = 4096;
    let offset = 0;

    while (offset < base64String.length) {
      const chunk = base64String.slice(offset, offset + chunkSize);
      chunks.push(chunk);
      offset += chunkSize;
    }

    return chunks;
  };

  const getAmountPayableFromBase64 = async (
    base64String: string
  ): Promise<number> => {
    const chunks = base64StringToChunks(base64String);
    let result: AxiosResponse<any, any>;
    for (let i = 0; i < chunks.length; i++) {
      const chunkData = {
        chunk: chunks[i],
        chunkIndex: i,
        totalChunks: chunks.length,
      };

      let e = await instance.post(
        `${config.serverAddress}/connections/resolve-home-bill-payable-amount`,
        chunkData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      result = e;
    }
    return parseFloat(result!.data.response);
  };

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = event.target.files as FileList;
    const file = selectedFiles?.[0] || null;
    setSelectedFile(file);
    setPreviewImage(file ? URL.createObjectURL(file) : "");
    onImageSelected(file);

    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        onAiProcessingChange(true);
        instance
          .post(`${config.serverAddress}/hbcform/stringify-image`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((response) => {
            const base64String = response.data.base64Image;
            console.log("stringified!");

            getAmountPayableFromBase64(base64String)
              .then((response) => {
                console.log(
                  "Base64 string uploaded successfully! result: " + response
                );
                onAmountResolved(response); // 目前暂时设置为 0
              })
              .catch((error) => {
                console.error("Error uploading base64 string:", error);
              })
              .finally(() => {
                onAiProcessingChange(false);
              });
          });
      } catch (error) {
        console.error("Error stringifying image:", error);
      }
    }
  };

  return (
    <Card>
      <div className="mx-3 my-3">
        <input
          type="file"
          onChange={handleImageSelect}
          className="p-3 rounded-xl shadow-medium bg-neutral-100 dark:bg-neutral-800 w-full"
        />
      </div>
      {selectedFile && (
        <img
          src={previewImage}
          alt="Selected Image"
          className="w-full h-[410px] object-cover rounded-b-md"
        />
      )}
    </Card>
  );
};

export default InsertBillImage;
