import React, { useState } from 'react';

interface InsertImageProps {
    onImageSelected: (file: File) => void;
}

const InsertImage: React.FC<InsertImageProps> = ({ onImageSelected }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string>('');

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files as FileList;
        const file = selectedFiles?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
            onImageSelected(file);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleImageSelect} />
            {selectedFile && (
                <img src={previewImage} alt="Selected Image" />
            )}
        </div>
    );
};

export default InsertImage;