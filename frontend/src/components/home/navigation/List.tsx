import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMobile } from "@/hooks";

const sections = [
  { label: "Features", href: "features" },
  { label: "Get Started", href: "cta" },
  { label: "Contact", href: "contact" },
];

const menuVariants = {
  initial: (isMobile: boolean) => ({
    opacity: isMobile ? 0 : 1,
    height: isMobile ? 0 : "auto",
  }),
  animate: {
    opacity: 1,
    height: "auto",
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: (isMobile: boolean) => ({
    opacity: isMobile ? 0 : 1,
    height: isMobile ? 0 : "auto",
  }),
};

const itemVariants = {
  initial: (isMobile: boolean) => ({
    opacity: isMobile ? 0 : 1,
  }),
  animate: {
    opacity: 1,
  },
  exit: (isMobile: boolean) => ({
    opacity: isMobile ? 0 : 1,
  }),
};

const hoverEffect = { color: "var(--primary)" };

const List = () => {
  const isMobile = useMobile();

  const styles = isMobile
    ? `top-20 gap-8 flex-col absolute left-0 w-full bg-surface-section`
    : "gap-6 lg:gap-12 flex-row justify-center static lg:absolute lg:left-1/2 lg:-translate-x-1/2";

  return (
    <motion.ul
      layout
      custom={isMobile}
      variants={menuVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`flex p-6 overflow-hidden ${styles}`}
    >
      {sections.map((section) => (
        <motion.li
          custom={isMobile}
          variants={itemVariants}
          whileHover={hoverEffect}
          className="cursor-pointer"
          key={section.label}
        >
          <Link to="/" hash={section.href}>
            {section.label}
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  );
};

export default List;
