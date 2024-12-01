import { useEffect, useContext, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseDB";
import { UserContext } from "../App";

export const GithubRedirect = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saveGitHubToken = async () => {
            if (!user) {
                return;
            }

            if (token) {
                try {
                    const { error } = await supabase
                        .from("users")
                        .update({ github_token: token })
                        .eq("id", user.id);

                    if (error) {
                        console.error("Error saving GitHub token:", error);
                    } else {
                        const { data: updatedUser, error: fetchError } =
                            await supabase
                                .from("users")
                                .select(
                                    "username, email, avatar_url, display_color, github_token"
                                )
                                .eq("id", user.id)
                                .single();

                        if (fetchError) {
                            console.error(
                                "Error fetching updated user data:",
                                fetchError
                            );
                        } else {
                            setUser({ ...user, ...updatedUser });
                            navigate("/dashboard");
                        }
                    }
                } catch (error) {
                    console.error(
                        "Unexpected error during GitHub token saving:",
                        error
                    );
                } finally {
                    setLoading(false);
                }
            } else {
                console.error("No token found in URL parameters.");
                setLoading(false);
            }
        };

        saveGitHubToken();
    }, [token, user, navigate, setUser]);

    if (loading) {
        return (
            <div>
                <h1>GitHub Authorization</h1>
                <p>Connecting to GitHub...</p>
            </div>
        );
    }

    return null;
};
