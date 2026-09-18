import { Link } from "@tanstack/react-router";

interface FooterProps {
  text: string;
  linkText: string;
  to: string;
}

const Footer = ({ text, linkText, to }: FooterProps) => (
  <div className="flex flex-col gap-3 my-8 text-sm text-foreground-secondary">
    <p>
      Forgot your password?{" "}
      <Link
        to="/auth/reset"
        className="text-primary font-semibold hover:text-tertiary transition-colors"
      >
        Reset it
      </Link>
    </p>
    <p>
      {text}{" "}
      <Link
        to={to}
        className="text-primary font-semibold cursor-pointer hover:text-tertiary transition-colors"
      >
        {linkText}
      </Link>
    </p>
  </div>
);

export default Footer;
