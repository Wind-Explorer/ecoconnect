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
}

const NextUIFormikInput = ({
  label,
  startContent,
  ...props
}: NextUIFormikInputProps) => {
  const [field, meta] = useField(props.name);
  const [inputType, setInputType] = useState(props.type);

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
    />
  );
};

export default NextUIFormikInput;
