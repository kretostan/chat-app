import OutlineButton from "../OutlineButton";
import PrimaryButton from "../PrimaryButton";
import CtaText from "./CtaText";

const Cta = () => {
  return (
    <section
      id="cta"
      className="flex justify-center scroll-mt-20 bg-linear-to-r from-primary to-secondary w-full"
    >
      <div className="flex flex-col max-w-200 w-full text-center gap-10 py-24 text-white">
        <CtaText />
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mx-8 mb-12">
          <PrimaryButton>Get Started Free</PrimaryButton>
          <OutlineButton>Schedule a Demo</OutlineButton>
        </div>
      </div>
    </section>
  );
};

export default Cta;
