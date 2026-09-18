interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  name: string;
  children: React.ReactNode;
}

const Input = ({ name, children, ...props }: InputProps) => (
  // FIX: Jeśli type === "password" to ustawić min/max, czy juz backend to ogarnia?
  <>
    <label
      htmlFor={name}
      className="text-xs font-medium text-foreground-secondary uppercase tracking-wider ml-0.5"
    >
      {children}
    </label>
    <input
      name={name}
      {...props}
      className="w-full px-4 py-3 text-sm bg-surface-input border border-border-default rounded-lg outline-none transition-all placeholder:text-foreground-muted focus:border-primary"
    />
  </>
);

export default Input;
