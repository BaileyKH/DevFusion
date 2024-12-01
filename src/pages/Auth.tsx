import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseDB";
import { motion } from "framer-motion";

import {
    Card,
    CardDescription,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [authenticating, setAuthenticating] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session) {
                navigate("/dashboard");
            } else {
                setIsCheckingSession(false);
            }
        };

        checkSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session) {
                    navigate("/dashboard");
                }
            }
        );

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [navigate]);

    const handleAuth = async () => {
        setAuthenticating(true);
        setError("");

        if (isSignUp) {
            // Check for existing usernames to prevent duplicates
            const { data: existingUsernames, error: usernameError } =
                await supabase
                    .from("users")
                    .select("username")
                    .eq("username", username);

            if (usernameError) {
                setError("Error checking username availability.");
                setAuthenticating(false);
                return;
            }

            if (existingUsernames && existingUsernames.length > 0) {
                setError("Username already exists. Please choose another one.");
                setAuthenticating(false);
                return;
            }

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                    },
                },
            });

            if (error) {
                alert(error.message);
            } else {
                setModalOpen(true);
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                setError("Incorrect Username or Password, please try again.");
            }
        }

        setAuthenticating(false);
    };

    const handleSignUpRedirect = () => {
        setModalOpen(false);
        navigate("/");
    };

    if (isCheckingSession) {
        return <div>Loading...</div>;
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-tr from-[#121212] via-[#0d0d0d] to-[#141414]">
            <motion.div
                className="absolute inset-0 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)] opacity-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ duration: 1.5 }}
            />
            <motion.div
                className="w-full max-w-md px-6 py-12 rounded-xl bg-[#1a1a1a]/80 backdrop-blur-sm shadow-xl border border-lightAccent/10"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold tracking-tight text-lightAccent">
                        {isSignUp
                            ? "Create an Account"
                            : "Sign In to Your Account"}
                    </h2>
                    {error && (
                        <p className="text-sm text-red-500 mt-2">{error}</p>
                    )}
                </div>

                <div className="space-y-6">
                    {isSignUp && (
                        <div>
                            <Label
                                htmlFor="username"
                                className="text-sm font-medium text-lightAccent"
                            >
                                Username
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                required
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 border-darkAccent/65 text-lightAccent"
                            />
                        </div>
                    )}

                    <div>
                        <Label
                            htmlFor="email"
                            className="text-sm font-medium text-lightAccent"
                        >
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 border-darkAccent/65 text-lightAccent"
                        />
                    </div>

                    <div>
                        <Label
                            htmlFor="password"
                            className="text-sm font-medium text-lightAccent"
                        >
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 border-darkAccent/65 text-lightAccent"
                        />
                    </div>

                    <div>
                        <Button
                            onClick={handleAuth}
                            disabled={authenticating}
                            className="w-full rounded-lg py-3 bg-gradient-to-r from-[#0398fc] to-[#00c6ff] text-lg font-semibold text-lightAccent shadow-md hover:shadow-lg hover:from-[#00a8f3] hover:to-[#009ecb] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {authenticating
                                ? "Processing..."
                                : isSignUp
                                ? "Sign Up"
                                : "Sign In"}
                        </Button>
                    </div>
                </div>

                <p
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="mt-10 text-center text-sm text-lightAccent/80 hover:text-primAccent cursor-pointer transition-all duration-300"
                >
                    {isSignUp
                        ? "Already have an account? Sign In"
                        : "Don’t have an account? Sign Up"}
                </p>
            </motion.div>

            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                    <Card className="bg-[#1a1a1a] text-lightAccent shadow-lg p-6 rounded-xl max-w-sm">
                        <CardHeader>
                            <CardTitle className="text-2xl text-primAccent">
                                Success!
                            </CardTitle>
                            <CardDescription className="text-lightAccent/70">
                                Thank you for signing up with DevFusion!
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>
                                Please check your email to verify your new
                                account. Happy Collaborating!
                            </p>
                        </CardContent>
                        <CardFooter className="pt-6">
                            <Button onClick={handleSignUpRedirect}>
                                Close
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
};
