export default function TextAreaField({ label, value, onChange }) {
  return (
    <div className="ui-field">
      <label className="ui-label">{label}</label>
      <textarea
        rows="4"
        value={value}
        onChange={onChange}
        aria-label={label}
        className="ui-control ui-textarea"
      />
    </div>
  );
}
