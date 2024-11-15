import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import { IconUserCircle } from '@tabler/icons-react';
import { ProfileModal } from "./ProfileModal";

export const Nav = () => {
  const user = useContext(UserContext);
  const navigate = useNavigate();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  return (
    <>
      <nav className="flex justify-between items-center p-4 bg-secDark text-lightAccent shadow-md nav-gradient">
        <Link to="/" className="text-2xl font-bold text-lightAccent">
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
                  <IconUserCircle
                    size={28}
                    className="text-white cursor-pointer"
                    onClick={() => setIsUserModalOpen(true)}
                  />
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="bg-primAccent hover:bg-red-950 px-3 py-1 rounded-md transition duration-300"
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