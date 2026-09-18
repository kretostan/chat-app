const Header = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="flex flex-col justify-center items-center gap-3 py-4">
    <h2
      className="text-5xl leading-tight text-primary font-bold"
      style={{ fontFamily: "var(--font-display)" }}
    >
      {title}
    </h2>
    <p className="text-sm text-foreground-secondary tracking-wide">
      {description}
    </p>
  </div>
);

export default Header;
