import { Select, SelectItem } from "@nextui-org/react";
import { ChangeEvent } from "react";

interface SimpleSelectProps {
    label: string;
    placeholder: string;
    options: Array<{ key: string; label: string }>;
    onChange: (value: string) => void;
}

const NextUIFormikSelect2 = ({ label, placeholder, options, onChange }: SimpleSelectProps) => {
    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value);
    };

    return (
        <Select
            aria-label={label}
            placeholder={placeholder}
            onChange={handleChange}
        >
            {options.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                    {option.label}
                </SelectItem>
            ))}
        </Select>
    );
};

export default NextUIFormikSelect2;
