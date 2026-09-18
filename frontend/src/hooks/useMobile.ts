import { useSyncExternalStore } from "react";

export const useMobile = (): boolean => {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    () => window.innerWidth < 768,
  );
};
