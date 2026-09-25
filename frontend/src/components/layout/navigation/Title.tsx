import { Link } from "@tanstack/react-router";

const Title = () => {
  return (
    <Link to="/" className="py-1 text-2xl font-bold cursor-pointer">
      Chat<span className="text-primary">App</span>
    </Link>
  );
};

export default Title;
