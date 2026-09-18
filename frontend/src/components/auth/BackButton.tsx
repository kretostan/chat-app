import { useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import LeftArrow from "@/assets/left-arrow.svg?react";

const BackButton = () => {
  const router = useRouter();

  return (
    <motion.button
      whileHover={{ backgroundColor: "var(--surface-elevated)" }}
      onClick={() => router.history.back()}
      className="flex items-center p-3 bg-surface-section rounded-full cursor-pointer"
    >
      <LeftArrow height={20} width={20} className="-translate-x-1/12" />
    </motion.button>
  );
};
export default BackButton;
