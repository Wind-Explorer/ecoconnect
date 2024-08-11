import React, { useState } from "react";
import { Button } from "@nextui-org/react";
import NextUIFormikTagInput from "./NextUIFormikTagInput";

type TagInputProps = {
    tags: string[];
    setTags: (tags: string[]) => void;
};

const TagInput: React.FC<TagInputProps> = ({ tags, setTags }) => {
    const [inputTag, setInputTag] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Handle input change and dynamic duplicate check
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTag = e.target.value.trim();
        setInputTag(newTag);

        // Dynamic duplicate check
        if (tags.some(tag => tag.toLowerCase() === newTag.toLowerCase())) {
            setError("Tag already added.");
        } else {
            setError(null);
        }
    };

    const handleAddTag = () => {
        if (error) {
            return; // Prevent adding if there's an error
        }

        if (inputTag.trim() !== "") {
            setTags([...tags, inputTag.trim()]);
            setInputTag(""); // Clear input field  
        }
    };

    const handleRemoveTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    return (
        <div>
            <div>
                <NextUIFormikTagInput
                    label="Tags (Optional)"
                    name="tagInput" // This name should be unique and not conflict with other form fields
                    type="text"
                    placeholder="Enter tags"
                    labelPlacement="inside"
                    value={inputTag}
                    onChange={handleInputChange} // Use the dynamic check handler
                />
                {error && <div className="text-red-500 mt-2">{error}</div>}
                <Button onPress={handleAddTag} disabled={!!error}>Add</Button>
            </div>
            <div className="flex gap-2 flex-wrap mt-4">
                {tags.map((tag, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-1 bg-gray-200 p-2 rounded"
                    >
                        <span>{tag}</span>
                        <button
                            type="button"
                            onClick={() => handleRemoveTag(index)}
                            className="ml-2 text-red-500"
                        >
                            X
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TagInput;