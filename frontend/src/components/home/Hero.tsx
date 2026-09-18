import OutlineButton from "@/components/home/OutlineButton";
import PrimaryButton from "@/components/home/PrimaryButton";
import Message from "./Message";

const Hero = () => {
  return (
    <header className="flex flex-col justify-center items-center gap-8 md:gap-10 lg:gap-12 mt-20 px-4 pt-20 pb-18 min-h-screen w-full bg-linear-to-r from-primary to-secondary text-center">
      <div className="flex flex-col justify-center items-center gap-6 md:gap-8 lg:gap-10 px-2 md:px-0">
        <h1 className="font-bold text-white text-3xl sm:text-4xl/12 md:text-6xl/20">
          Your team&apos;s conversations belong in one place.
        </h1>
        <p className="max-w-[500px] sm:max-w-[600px] text-white text-lg md:text-xl opacity-90">
          Real-time messaging, file sharing, and video calls for teams that
          don&apos;t want another app to manage. No templates. No forced
          workflows. Just your work.
        </p>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-6 px-4 md:px-0 w-full md:w-auto">
        <PrimaryButton>get started free</PrimaryButton>
        <OutlineButton>watch demo</OutlineButton>
      </div>
      <div className="bg-surface-elevated mx-4 mt-8 p-6 md:p-10 rounded-2xl max-w-[900px] w-full">
        <div className="flex flex-col bg-surface-base p-5 gap-4 rounded-xl">
          <div className="flex bg-surface-elevated p-4 gap-4 border border-border-default rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-primary font-semibold text-white rounded-full">
              ML
            </div>
            <div className="flex flex-col items-start">
              <p>Marcus Lee</p>
              <p className="text-foreground-secondary text-sm">Online</p>
            </div>
          </div>
          <Message background="bg-surface-message-user">
            The PR is ready for review — I&apos;ve updated the docs with the new
            specs from Tuesday
          </Message>
          <Message justify background="bg-surface-message-answer">
            Looks good. Just move the color tokens to design-system-main first,
            we need UI on a consistent branch.
          </Message>
          <Message mobile="sm:flex" background="bg-surface-message-user">
            Pushed to <code className="text-primary">design-system/main</code>
          </Message>
          <Message
            mobile="md:flex"
            justify
            background="bg-surface-message-answer"
          >
            Pulling it now. Sync with Sarah on the layout — free for 10m?
          </Message>
          <Message mobile="md:flex" background="bg-surface-message-user">
            Yep. Ping whoever else needs to be there and I&apos;ll send a link.
          </Message>
        </div>
      </div>
    </header>
  );
};

export default Hero;
