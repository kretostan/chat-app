import Field from "@/components/home/stats/Field";

const Stats = () => {
  return (
    <section
      id="stats"
      className="flex justify-around items-center gap-14 scroll-mt-20 px-20 py-18 text-center max-w-300 w-full flex-wrap"
    >
      <Field number="10M+" description="Active Users" />
      <Field number="150+" description="Countries" />
      <Field number="99.9%" description="Uptime" />
      <Field number="24/7" description="Support" />
    </section>
  );
};

export default Stats;
