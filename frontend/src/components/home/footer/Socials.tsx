import { motion } from "framer-motion";
import GitHubIcon from "@/assets/github.svg?react";
import LinkedInIcon from "@/assets/linkedin.svg?react";
import MailIcon from "@/assets/mail.svg?react";

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

const socials: { href: string; label: string; Icon: IconComponent }[] = [
  {
    href: "https://github.com/Kretostan",
    label: "GitHub",
    Icon: GitHubIcon,
  },
  {
    href: "https://www.linkedin.com/in/jakub-kret-925865263",
    label: "LinkedIn",
    Icon: LinkedInIcon,
  },
  {
    href: "mailto:kretostan@portfolio.com",
    label: "Email",
    Icon: MailIcon,
  },
];

const hoverEffect = {
  y: -2,
  color: "var(--foreground-primary)",
  backgroundColor: "var(--primary)",
};

const Socials = () => {
  return (
    <ul className="flex gap-4">
      {socials.map(({ href, label, Icon }) => (
        <motion.li
          key={label}
          whileHover={hoverEffect}
          className="flex justify-center items-center h-11 w-11 bg-surface-elevated text-center rounded-full"
        >
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="p-2 rounded-full"
          >
            <Icon height="100%" width="100%" />
          </a>
        </motion.li>
      ))}
    </ul>
  );
};

export default Socials;
