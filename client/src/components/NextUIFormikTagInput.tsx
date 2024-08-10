import { Input } from "@nextui-org/react";
import { useField } from "formik";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "../icons";

interface NextUIFormikTagInputProps {
    label: string;
    name: string;
    type: string;
    placeholder: string;
    labelPlacement?: "inside" | "outside";
    startContent?: JSX.Element;
    readOnly?: boolean;
    setFieldValue?: (field: string, value: any, shouldValidate?: boolean) => void;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Allow onChange prop
}

const NextUIFormikTagInput = ({
    label,
    startContent,
    readOnly = false,
    setFieldValue,
    value,
    onChange,
    ...props
}: NextUIFormikTagInputProps) => {
    // Use Formik's useField hook to get field props and meta information
    const [field, meta] = useField(props.name);
    const [inputType, setInputType] = useState(props.type);

    // Handle changes in the input field
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        field.onChange(e);
        if (setFieldValue) {
            setFieldValue(props.name, value);
        }
        if (onChange) {
            onChange(e); // Call the passed onChange handler
          }
    };

    return (
        <Input
            {...field}
            {...props}
            label={label}
            type={inputType}
            isInvalid={meta.touched && !!meta.error}
            errorMessage={meta.touched && meta.error ? meta.error : ""}
            startContent={startContent}
            endContent={
                props.type === "password" ? (
                    <>
                        <button
                            type="button"
                            onClick={() => {
                                setInputType(inputType === "text" ? "password" : "text");
                            }}
                        >
                            {inputType === "password" ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    </>
                ) : null
            }
            readOnly={readOnly}
            onChange={handleChange}
            value={value} // Ensure the value from Formik is applied to the input
        />
    );
};

export default NextUIFormikTagInput;
