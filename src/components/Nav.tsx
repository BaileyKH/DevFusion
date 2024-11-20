import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import { ProfileModal } from "./ProfileModal";

export const Nav = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  return (
    <>
      <nav className="flex justify-between items-center p-4 bg-white/5 text-lightAccent/85 nav-shadow">
        <Link to="/" className="text-2xl font-bold text-lightAccent/85">
          DevFusion
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {user.avatar_url ? (
                <div className="flex items-center gap-x-8">
                  <Link to='/dashboard' className="tracking-wider hover:text-primAccent hover:underline underline-offset-4 transition duration-200 ease-in">Dashboard</Link>
                  <img
                    src={user.avatar_url}
                    alt="User Avatar"
                    className="h-10 w-10 rounded-full cursor-pointer border border-darkAccent"
                    onClick={() => setIsUserModalOpen(true)}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-x-8">
                  <Link to='/dashboard'>Dashboard</Link>
                  <div onClick={() => setIsUserModalOpen(true)} className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-lg text-primAccent">
                      {user.username[0].toUpperCase()}
                  </div>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="bg-primAccent hover:bg-blue-800 px-3 py-1 rounded-md transition duration-300"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>
      {isUserModalOpen && (
        <ProfileModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} />
      )}
    </>
  );
};