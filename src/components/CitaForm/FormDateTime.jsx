import DatePickerField from "../common/DatePickerField";

export default function FormDateTime({ label, name, value, onChange }) {
  return (
    <DatePickerField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      mode="datetime"
      placeholder="dd/mm/aaaa hh:mm"
    />
  );
}
