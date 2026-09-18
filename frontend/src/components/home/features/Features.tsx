import { FEATURES } from "@/data/features";
import Field from "./FeatureField";

const Features = () => {
  return (
    <section
      id="features"
      className="flex flex-col items-center px-6 pt-20 pb-16 scroll-mt-20 w-full bg-surface-section text-center"
    >
      <div>
        <h4 className="text-3xl/12 md:text-5xl/18 font-bold">
          One app. No extra tool to learn.
        </h4>
        <p className="mt-6 mb-20 text-foreground-secondary">
          Messaging, file sharing, video calls — the basics done right so your
          team can focus on actual work.
        </p>
      </div>
      <div className="flex flex-col md:flex-row justify-center gap-10 flex-wrap max-w-300 w-full">
        {FEATURES.map(({ id, ...rest }) => (
          <Field key={id} {...rest} />
        ))}
      </div>
    </section>
  );
};

export default Features;
