import { motion } from "framer-motion";

type FooterItemProps = {
  children: React.ReactNode;
};

const FooterItem = ({ children }: FooterItemProps) => {
  return (
    <motion.li
      whileHover={{ color: "var(--primary)" }}
      className="cursor-pointer"
    >
      {children}
    </motion.li>
  );
};

export default FooterItem;
