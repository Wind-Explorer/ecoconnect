import { Input } from "@nextui-org/react";
import { useField } from "formik";

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

  return (
    <Input
      {...field}
      {...props}
      label={label}
      isInvalid={meta.touched && !!meta.error}
      errorMessage={meta.touched && meta.error ? meta.error : ""}
      startContent={startContent}
    />
  );
};

export default NextUIFormikInput;
