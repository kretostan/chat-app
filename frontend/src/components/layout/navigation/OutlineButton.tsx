import { motion } from "framer-motion";

interface OutlineButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const OutlineButton = ({ children, onClick }: OutlineButtonProps) => {
  return (
    <motion.button
      whileHover={{
        color: "var(--foreground-primary)",
        backgroundColor: "var(--primary)",
      }}
      onClick={onClick}
      className="py-3 w-18 md:w-24 text-sm md:text-base text-primary rounded-lg border-2 border-primary cursor-pointer"
    >
      {children}
    </motion.button>
  );
};

export default OutlineButton;
