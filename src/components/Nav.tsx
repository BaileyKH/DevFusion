import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import { ProfileModal } from "./ProfileModal";

import { motion } from "framer-motion";

export const Nav = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    return (
        <>
            <nav className="flex justify-between items-center py-4 px-8 bg-gradient-to-r from-[#121212] via-[#1a1a1a] to-[#0d0d0d] shadow-lg text-lightAccent/85 border-b border-darkAccent/30">
                <Link
                    to="/"
                    className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#0398fc] to-[#00c6ff] hover:scale-105 transform transition-transform duration-300"
                >
                    DevFusion
                </Link>
                <div className="flex items-center space-x-8">
                    {user ? (
                        <>
                            <Link
                                to="/dashboard"
                                className="text-lg tracking-wider font-semibold hover:text-primAccent hover:underline underline-offset-4 transition duration-300 ease-in"
                            >
                                Dashboard
                            </Link>
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 2 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative cursor-pointer"
                                onClick={() => setIsUserModalOpen(true)}
                            >
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt="User Avatar"
                                        className="h-12 w-12 rounded-full border border-primAccent shadow-md"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-lg text-primAccent border border-primAccent">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                )}
                            </motion.div>
                        </>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/auth")}
                            className="bg-gradient-to-r from-[#0398fc] to-[#00c6ff] px-4 py-2 rounded-md text-lg font-semibold text-white shadow-md transition duration-300 transform hover:scale-105"
                        >
                            Sign In
                        </motion.button>
                    )}
                </div>
            </nav>

            {/* Profile Modal */}
            {isUserModalOpen && (
                <ProfileModal
                    isOpen={isUserModalOpen}
                    onClose={() => setIsUserModalOpen(false)}
                />
            )}
        </>
    );
};
