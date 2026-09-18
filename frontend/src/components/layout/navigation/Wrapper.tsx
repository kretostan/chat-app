import { useCurrentTheme } from "@/hooks/useThemeContext";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useCurrentTheme();

  const navShadow = resolvedTheme === "light" ? "gray" : "black";

  return (
    <nav
      className={`fixed top-0 flex justify-center items-center h-20 w-screen bg-surface-section border-b border-border-default shadow-[0_0_10px_1px_${navShadow}] z-1000`}
    >
      {children}
    </nav>
  );
};

export default Wrapper;
