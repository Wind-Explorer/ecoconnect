import { DatePicker } from "@nextui-org/react";
import { useField } from "formik";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";

interface NextUIFormikDatePickerProps {
    label: string;
    name: string;
    className?: string;
}

const dateToCalendarDate = (date: Date): CalendarDate => {
    return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
};

// NextUIFormikDatePicker component
export const NextUIFormikDatePicker = ({
    label,
    ...props
}: NextUIFormikDatePickerProps) => {
    const [field, meta, helpers] = useField(props.name);

    const handleChange = (date: CalendarDate | null) => {
        if (date) {
            helpers.setValue(date.toDate('UTC')); // Ensure date is converted to a proper Date object with a timezone
        } else {
            helpers.setValue(null);
        }
    };

    return (
        <DatePicker
            {...props}
            label={label}
            value={field.value ? dateToCalendarDate(new Date(field.value)) : null} // Convert field value to CalendarDate
            onChange={handleChange}
            isInvalid={meta.touched && !!meta.error}
            errorMessage={meta.touched && meta.error ? meta.error : ""}
            minValue={today(getLocalTimeZone())}
            defaultValue={today(getLocalTimeZone()).subtract({ days: 1 })}
        />
    );
};
