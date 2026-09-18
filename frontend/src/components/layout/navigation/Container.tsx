const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-between items-center px-6 max-w-300 w-full">
      {children}
    </div>
  );
};

export default Container;
