export default function SubmitButton({ disabled, children }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`ui-button col-span-1 w-full md:col-span-2 md:w-auto md:justify-self-end ${
        disabled
          ? "ui-button-secondary cursor-not-allowed"
          : "ui-button-primary"
      }`}
    >
      {children}
    </button>
  );
}
