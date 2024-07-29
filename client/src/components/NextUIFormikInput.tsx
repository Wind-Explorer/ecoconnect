import { Input } from "@nextui-org/react";
import { useField } from "formik";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "../icons";

interface NextUIFormikInputProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  labelPlacement?: "inside" | "outside";
  startContent?: JSX.Element;
  readOnly?: boolean;
  setFieldValue?: (field: string, value: any, shouldValidate?: boolean) => void;
}

const NextUIFormikInput = ({
  label,
  startContent,
  readOnly = false,
  setFieldValue,
  ...props
}: NextUIFormikInputProps) => {
  const [field, meta] = useField(props.name);
  const [inputType, setInputType] = useState(props.type);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    field.onChange(e);
    if (setFieldValue) {
      setFieldValue(props.name, value);
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
        props.type == "password" ? (
          <>
            <button
              type="button"
              onClick={() => {
                setInputType(inputType == "text" ? "password" : "text");
              }}
            >
              {inputType == "password" ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </>
        ) : null
      }
      readOnly={readOnly}
      onChange={handleChange}
    />
  );
};

export default NextUIFormikInput;
