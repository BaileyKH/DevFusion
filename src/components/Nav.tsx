import { Link, useNavigate } from "react-router-dom";

export const Nav = () => {

    const navigate = useNavigate();

    return(
        <nav className="flex justify-between p-4 bg-primAccent text-white">
            <Link to="/" className="text-2xl font-bold text-white">
                DevFusion
            </Link>
            <div>
                <button onClick={() => navigate('/auth')}>Sign In</button>
            </div>
        </nav>
    );
}