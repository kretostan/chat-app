import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import List from "./List";

const MobileList = () => {
  const [showList, setShowList] = useState<boolean>(false);

  const showMenu = () => setShowList((prevState) => !prevState);

  return (
    <div className="flex md:hidden h-full">
      <button
        type="button"
        onClick={showMenu}
        className="static flex justify-center items-center text-2xl cursor-pointer"
      >
        ☰
      </button>
      <AnimatePresence>{showList && <List />}</AnimatePresence>
    </div>
  );
};

export default MobileList;
