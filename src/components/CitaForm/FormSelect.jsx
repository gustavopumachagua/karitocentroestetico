import CustomSelect from "../common/CustomSelect";

export default function FormSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  disabled,
}) {
  return (
    <div className="ui-field min-w-0">
      <label className="ui-label">{label}</label>
      <CustomSelect
        name={name}
        ariaLabel={label}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={`Seleccione ${label}`}
        size="md"
        options={[
          { value: "", label: `Seleccione ${label}` },
          ...options.map((opt) =>
            typeof opt === "object"
              ? opt
              : {
                  value: opt,
                  label: opt,
                }
          ),
        ]}
      />
    </div>
  );
}
