import { Textarea } from "@nextui-org/react";
import { useField } from "formik";

interface NextUIFormikTextareaProps {
  label: string;
  name: string;
  placeholder: string;
  labelPlacement?: "inside" | "outside";
}

const NextUIFormikTextarea = ({
  label,
  ...props
}: NextUIFormikTextareaProps) => {
  const [field, meta] = useField(props.name);

  return (
    <Textarea
      {...field}
      {...props}
      label={label}
      isInvalid={meta.touched && !!meta.error}
      errorMessage={meta.touched && meta.error ? meta.error : ""}
    />
  );
};

export default NextUIFormikTextarea;