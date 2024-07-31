import { RadioGroup } from "@nextui-org/react";
import { useField } from "formik";

interface NextUIFormikRadioGroupProps {
    label: string;
    name: string;
    className?: string;
    children: React.ReactNode;
}

// NextUIFormikRadioGroup component
export const NextUIFormikRadioGroup = ({
    label,
    ...props
}: NextUIFormikRadioGroupProps) => {
    const [field, meta, helpers] = useField(props.name);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        helpers.setValue(event.target.value);
    };

    return (
        <RadioGroup
            {...props}
            label={label}
            value={field.value}
            onChange={handleChange}
            isInvalid={meta.touched && !!meta.error}
            errorMessage={meta.touched && meta.error ? meta.error : ""}
        >
            {props.children}
        </RadioGroup>
    );
};