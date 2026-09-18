import { motion } from "framer-motion";

interface PrimaryButtonProps {
  children: React.ReactNode;
}

const PrimaryButton = ({ children }: PrimaryButtonProps) => {
  return (
    <motion.button
      initial={{
        y: 0,
        boxShadow: "none",
      }}
      whileHover={{
        y: -2,
        boxShadow: "0 0 12px 1px var(--foreground-primary)",
      }}
      className="py-4 w-full max-w-75 md:w-50 bg-white text-sm md:text-lg text-primary font-medium rounded-xl cursor-pointer"
    >
      {children}
    </motion.button>
  );
};

export default PrimaryButton;
