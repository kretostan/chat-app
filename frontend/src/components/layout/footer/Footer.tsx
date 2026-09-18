import Copyright from "./Copyright";
import FooterItem from "./FooterItem";

const Footer = ({ children }: { children?: React.ReactNode }) => {
  return (
    <section
      id="contact"
      className="flex flex-col items-center gap-8 scroll-mt-20 pt-12 px-6 bg-surface-footer text-foreground-secondary"
    >
      <h4 className="text-3xl font-semibold">
        Chat<span className="text-primary">App</span>
      </h4>
      <p className="text-foreground-primary">
        Messaging your team will actually use.
      </p>
      <ul className="flex flex-col sm:flex-row items-center gap-4 text-sm">
        <FooterItem>Features</FooterItem>
        <FooterItem>Contact</FooterItem>
        <FooterItem>Privacy</FooterItem>
        <FooterItem>Terms</FooterItem>
      </ul>
      {children}
      <Copyright />
    </section>
  );
};

export default Footer;
