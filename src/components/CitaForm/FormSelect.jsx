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
    <div className="flex flex-col">
      <label className="text-sm text-slate-300 mb-2">{label}</label>
      <CustomSelect
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={`Seleccione ${label}`}
        size="lg"
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
