import { motion } from "framer-motion";
import type { Feature } from "@/types";

type FieldProps = Omit<Feature, "id">;

const Field = ({ text, title, Icon, iconSize }: FieldProps) => {
  return (
    <motion.div
      initial={{
        y: 0,
        boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
        borderColor: "var(--border-default)",
      }}
      whileHover={{
        y: -6,
        boxShadow: "0 0 5px 1px var(--primary)",
        borderColor: "var(--primary)",
      }}
      transition={{ type: "tween", duration: 0.3 }}
      className="flex flex-col gap-5 items-center text-center md:w-[45%] lg:w-[30%] bg-surface-elevated rounded-2xl border border-border-default p-8"
    >
      <motion.span
        initial={{ boxShadow: "0 0 5px 1px var(--primary)" }}
        className="flex items-center justify-center h-20 w-20 bg-primary rounded-full"
      >
        <Icon height={iconSize} width={iconSize} />
      </motion.span>
      <h5 className="text-2xl font-semibold">{title}</h5>
      <p className="text-foreground-secondary">{text}</p>
    </motion.div>
  );
};

export default Field;
