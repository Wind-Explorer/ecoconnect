import React, { useState, useEffect } from 'react';

interface InsertPostImageProps {
    onImageSelected: (file: File | null) => void;
    initialImageUrl?: string; // Optional prop for initial image URL
}

const InsertPostImage: React.FC<InsertPostImageProps> = ({ onImageSelected, initialImageUrl }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string>('');

    useEffect(() => {
        // Update the preview image if there's an initial image URL
        if (initialImageUrl) {
            setPreviewImage(initialImageUrl);
            setSelectedFile(null); // Clear any file selection
        }
    }, [initialImageUrl]);

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files as FileList;
        const file = selectedFiles?.[0] || null;
        setSelectedFile(file);
        setPreviewImage(file ? URL.createObjectURL(file) : '');
        onImageSelected(file);
    };

    return (
        <div className={`flex flex-col dark:bg-zinc-800 rounded-md ${selectedFile || initialImageUrl ? 'h-auto' : 'h-20'}`}
            style={{ width: 300 }}>
            <div>
                <div className="flex flex-col">
                    <input
                        type="file"
                        onChange={handleImageSelect}
                        className="mb-3"
                    />
                </div>
                {(previewImage || initialImageUrl) && (
                    <div>
                        <img
                            src={previewImage || initialImageUrl}
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
