interface NavButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const NavButton = ({ children, onClick }: NavButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group py-3 px-5 text-sm font-medium rounded-lg cursor-pointer relative transition-all duration-300
        border border-white/10 hover:border-primary hover:bg-primary"
    >
      <span className="relative flex items-center gap-1.5 text-white/70 group-hover:text-black transition-colors duration-300">
        {children}
      </span>
    </button>
  );
};

export default NavButton;
