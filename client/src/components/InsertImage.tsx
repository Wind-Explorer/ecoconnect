import React, { useState } from "react";

interface InsertImageProps {
    label: string;
    onImageSelected: (file: File | null) => void;
}

const InsertImage: React.FC<InsertImageProps> = ({ label, onImageSelected }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string>('');

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files as FileList;
        const file = selectedFiles?.[0] || null;
        setSelectedFile(file);
        setPreviewImage(file ? URL.createObjectURL(file) : '');
        onImageSelected(file);
    };

    return (
        <div
            className="flex flex-col items-center p-5 bg-white dark:bg-zinc-800 rounded-md"
            style={{ width: 350, height: 530 }}
        >
            <label className="mb-2 font-bold text-xl">{label}</label>
            <input
                type="file"
                onChange={handleImageSelect}
                className="mb-4"
            />
            {selectedFile && (
                <img
                    src={previewImage}
                    alt="Selected Image"
                    className="w-full h-[410px] object-cover rounded-md"
                />
            )}
        </div>
    );
};

export default InsertImage;