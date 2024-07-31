import { Select, SelectItem } from "@nextui-org/react";
import { useField, useFormikContext } from "formik";

interface NextUIFormikSelectProps {
  label: string;
  name: string;
  placeholder: string;
  labelPlacement?: "inside" | "outside";
  options: Array<{ key: string; label: string }>;
}

const NextUIFormikSelect = ({
  label,
  name,
  placeholder,
  labelPlacement = "outside",
  options,
}: NextUIFormikSelectProps) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFieldValue(name, e.target.value);
  };

  return (
    <Select
      {...field}
      label={label}
      labelPlacement={labelPlacement}
      placeholder={placeholder}
      selectedKeys={[field.value]}
      onChange={handleChange}
      isInvalid={meta.touched && !!meta.error}
      errorMessage={meta.touched && meta.error ? meta.error : ""}
    >
      {options.map((option) => (
        <SelectItem key={option.key} value={option.key}>
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
};

export default NextUIFormikSelect;
