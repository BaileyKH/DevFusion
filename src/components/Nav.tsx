import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../App"; 
import { supabase } from "../supabaseDB"; 

export const Nav = () => {
  const navigate = useNavigate();
  const user = useContext(UserContext); 

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      navigate("/"); 
    }
  };

  return (
    <nav className="flex justify-between p-4 bg-primAccent text-white">
      <Link to="/" className="text-2xl font-bold text-white">
        DevFusion
      </Link>
      <div>
        {user ? (
          <button onClick={handleSignOut}>Sign Out</button>
        ) : (
          <button onClick={() => navigate("/auth")}>Sign In</button>
        )}
      </div>
    </nav>
  );
};
