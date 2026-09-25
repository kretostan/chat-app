import { Link, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";

interface DesktopProps {
  username: string;
}

export default function Desktop({ username }: DesktopProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.navigate({ to: "/" });
  };

  return (
    <div className="flex items-center justify-center px-4">
      <p className="text-sm text-foreground-secondary rounded-full bg-red-600">
        <span className="text-primary">{username.charAt(0)}</span>
      </p>
      <Link
        to="/app/settings"
        className="block my-3 px-4 py-2 text-sm font-medium rounded-lg hover:bg-hover transition-colors"
        style={{ color: "var(--foreground-primary)" }}
      >
        Settings
      </Link>
      <motion.button
        type="button"
        initial={{ color: "var(--foreground-primary)" }}
        whileHover={{ color: "var(--tertiary)" }}
        className="px-1 cursor-pointer text-sm"
        onClick={handleLogout}
      >
        Logout
      </motion.button>
    </div>
  );
}
