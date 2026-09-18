import { motion } from "framer-motion";
import HeartIcon from "@/assets/heart.svg?react";

const Copyright = () => {
  const year = new Date().getFullYear();

  // FIX: cofniecie strony po zmianie theme nie aktualizuje theme (trzeba odswiezyc strone lub wejsc). wina cache?
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Gradient divider with centered decorative mark */}
      <div className="relative flex items-center justify-center w-full">
        <motion.div
          className="absolute left-0 right-0 h-px dark:bg-gradient-to-r dark:from-transparent dark:via-neutral-600/25 dark:to-transparent bg-gradient-to-r from-transparent via-neutral-400/30 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: [0.42, 0, 0.58, 1] }}
        />
      </div>

      {/* Copyright text */}
      <p className="text-xs whitespace-nowrap">
        &copy; {year} All rights reserved.
      </p>
      <p className="flex items-center gap-1.5 text-xs">
        Built with
        <HeartIcon height="14px" width="14px" className="text-primary" />
        Jakub Kret
      </p>
    </div>
  );
};

export default Copyright;
