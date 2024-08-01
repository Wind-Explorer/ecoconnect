import React, { useState } from 'react';

interface InsertPostImageProps {
    onImageSelected: (file: File | null) => void;
}

const InsertPostImage: React.FC<InsertPostImageProps> = ({ onImageSelected }) => {
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
        <div className={`flex flex-col dark:bg-zinc-800 rounded-md ${selectedFile ? 'h-auto' : 'h-20'}`}
            style={{ width: 300 }}>
            <div>
                <div className="flex flex-col">
                    <input
                        type="file"
                        onChange={handleImageSelect}
                        className="mb-3"
                    />
                </div>
                {selectedFile && (
                    <div>
                        <img
                            src={previewImage}
                            alt="Selected Image"
                            className="w-full h-full object-cover rounded-md"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default InsertPostImage;
