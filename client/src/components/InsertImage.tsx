import React, { useState } from 'react';

interface InsertImageProps {
    onImageSelected: (file: File | null) => void;
}

const InsertImage: React.FC<InsertImageProps> = ({ onImageSelected }) => {
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
            style={{ width: 400, height: 500 }}
        >
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
