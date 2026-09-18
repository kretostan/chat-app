import { Link } from "@tanstack/react-router";
import WarningIcon from "@/assets/warning.svg?react";

const Alert = ({
  description,
  hasLink,
}: {
  description: string;
  hasLink?: boolean;
}) => (
  <div className="flex items-start gap-3 px-4 py-3 text-xs bg-surface-section border border-error/20 rounded-lg">
    <WarningIcon height={28} width={28} className="shrink-0 mt-0.5" />
    <p>
      {description}
      {hasLink && (
        <Link
          to="/auth/reset"
          className="text-primary hover:text-tertiary transition-colors ml-1"
        >
          Find your account and log in.
        </Link>
      )}
    </p>
  </div>
);

export default Alert;
