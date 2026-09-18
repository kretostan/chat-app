const Button = ({ disabled, text }: { disabled: boolean; text: string }) => (
  <button
    type="submit"
    className="w-full mt-1 py-3 text-sm font-semibold transition-colors rounded-lg cursor-pointer disabled:cursor-not-allowed bg-primary text-background hover:bg-secondary disabled:text-foreground-muted disabled:bg-surface-elevated"
    disabled={disabled}
  >
    {text}
  </button>
);

export default Button;
