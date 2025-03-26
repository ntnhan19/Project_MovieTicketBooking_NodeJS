import { Link } from "react-router-dom";
import { Button } from "antd";

const Navbar = () => {
  return (
    <nav className="flex justify-between p-4 bg-gray-800 text-white">
      <Link to="/" className="text-xl font-bold">
        🎬 Movie Ticket
      </Link>
      <div>
        <Link to="/profile">
          <Button type="primary">Hồ Sơ</Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
