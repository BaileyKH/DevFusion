import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseDB";
import { UserContext } from "../App";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import { motion } from "framer-motion";
import {
    IconLogout,
    IconGitBranch,
    IconX,
    IconUpload,
} from "@tabler/icons-react";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
    isOpen,
    onClose,
}) => {
    const { user, setUser } = useContext(UserContext);
    const [email, setEmail] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [avatarUploadError, setAvatarUploadError] = useState<string | null>(
        null
    );
    const [isGitHubConnected, setIsGitHubConnected] = useState(false);
    const { toast } = useToast();

    const navigate = useNavigate();

    // Sync initial state with user data when modal is open or user data changes
    useEffect(() => {
        if (user) {
            setSelectedColor(user.chat_color || "#FFFFFF");
            setEmail(user.email || "");
            setIsGitHubConnected(!!user.github_token);
        }
    }, [user]);

    // Refetch user data after GitHub connection or disconnection
    const refreshUserData = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from("users")
            .select("username, email, avatar_url, display_color, github_token")
            .eq("id", user.id)
            .single();

        if (error) {
            console.error("Error fetching user data:", error);
        } else {
            if (data) {
                setUser({ ...user, ...data });
                setIsGitHubConnected(!!data.github_token);
                setSelectedColor(data.display_color || "#FFFFFF");
                setEmail(data.email || "");
            }
        }
    };

    if (!isOpen) return null;

    const handleSignOut = async () => {
        if (user) {
            await supabase.auth.signOut();
            onClose();
            navigate("/");
        }
    };

    // Handle avatar file upload
    const handleAvatarUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file || !user) {
            return;
        }

        try {
            const { data, error } = await supabase.storage
                .from("avatars")
                .upload(`${user.id}/${file.name}`, file, {
                    cacheControl: "3600",
                    upsert: true,
                    metadata: {
                        owner: user.id,
                    },
                });

            if (error) {
                console.error("Error uploading avatar:", error);
                setAvatarUploadError(
                    "Error uploading avatar. Please try again."
                );
                return;
            }

            if (data) {
                const publicURL = supabase.storage
                    .from("avatars")
                    .getPublicUrl(`${user.id}/${file.name}`);

                if (publicURL.data) {
                    const avatarUrl = publicURL.data.publicUrl;

                    const { error: updateError } = await supabase
                        .from("users")
                        .update({ avatar_url: avatarUrl })
                        .eq("id", user.id);

                    if (updateError) {
                        console.error(
                            "Error updating avatar URL:",
                            updateError
                        );
                        toast({
                            title: "Error",
                            description:
                                "Error updating avatar URL. Please try again",
                            variant: "destructive",
                        });
                        return;
                    } else {
                        toast({
                            title: "Success",
                            description: "Avatar updated successfully!",
                        });
                        await refreshUserData();
                    }
                }
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            setAvatarUploadError(
                "Unexpected error uploading avatar. Please try again."
            );
        }
    };

    // Handle button to trigger file input for avatar upload
    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handle display color update
    const handleConfirmColor = async () => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from("users")
                .update({ display_color: selectedColor })
                .eq("id", user.id);

            if (error) {
                console.error("Error updating color:", error);
                setError("Error updating chat color. Please try again later.");
            } else {
                toast({
                    title: "Success",
                    description: "Chat color updated successfully.",
                });
                await refreshUserData();
            }
        } catch (error) {
            console.error("Unexpected error while updating chat color:", error);
            setError("Unexpected error occurred. Please try again.");
        }
    };

    // Handle email change
    const handleEmailChange = async () => {
        if (!email || !user) {
            setError("Please enter a valid email.");
            return;
        }

        const { error: updateError } = await supabase
            .from("users")
            .update({ email })
            .eq("id", user.id);

        if (updateError) {
            console.error("Error updating email:", updateError);
            setError("Error updating email.");
        } else {
            setError(null);
            toast({
                title: "Success",
                description: "Email updated successfully.",
            });
            await refreshUserData();
        }
    };

    // Handle GitHub connect
    const handleGitHubConnect = () => {
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${
            import.meta.env.VITE_GITHUB_CLIENT_ID
        }&scope=repo`;
    };

    // Handle GitHub disconnect
    const handleDisconnectGitHub = async () => {
        if (!user) return;

        const { error } = await supabase
            .from("users")
            .update({ github_token: null })
            .eq("id", user.id);

        if (error) {
            console.error("Error disconnecting GitHub:", error);
            setError("Error disconnecting GitHub.");
        } else {
            toast({
                title: "Success",
                description: "GitHub disconnected successfully",
            });
            await refreshUserData();
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-[#1e1e1e] border border-darkAccent/30 rounded-lg max-w-lg w-full p-6 relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-lightAccent/70 hover:text-lightAccent transition duration-300"
                >
                    <IconX size={24} />
                </button>
                <Card className="bg-primDark border-none">
                    <CardHeader>
                        <h2 className="text-lightAccent text-3xl font-bold mb-4">
                            User Settings
                        </h2>
                        <p className="text-lightAccent/60 text-sm">
                            Customize your profile and account settings.
                        </p>
                        {error && (
                            <p className="text-red-500 my-2">
                                There was an issue updating your account
                                settings. Please try again
                            </p>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-6 mt-6">
                        <div className="space-y-4">
                            <Label
                                htmlFor="email"
                                className="text-lightAccent text-sm tracking-wider"
                            >
                                Email Address
                            </Label>
                            <div className="flex space-x-4">
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-grow border border-darkAccent/30 text-lightAccent rounded-md"
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleEmailChange}
                                    className="text-lightAccent px-3 transition duration-300 ease-in"
                                >
                                    Update
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label
                                htmlFor="profile-picture"
                                className="text-lightAccent text-sm tracking-wider"
                            >
                                Profile Picture
                            </Label>
                            {avatarUploadError && (
                                <p className="text-red-500 my-2">
                                    Issue uploading profile picture, please try
                                    again
                                </p>
                            )}
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="outline"
                                    onClick={handleButtonClick}
                                    className="text-lightAccent px-3 transition duration-300 ease-in flex items-center"
                                >
                                    <IconUpload size={18} className="mr-2" />
                                    Upload File
                                </Button>
                                <Input
                                    id="profile-picture"
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: "none" }}
                                    onChange={handleAvatarUpload}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label
                                htmlFor="profile-color"
                                className="text-lightAccent text-sm tracking-wider"
                            >
                                Profile Color
                            </Label>
                            <div className="flex items-center space-x-4">
                                <Input
                                    id="profile-color"
                                    type="color"
                                    value={selectedColor}
                                    onChange={(e) =>
                                        setSelectedColor(e.target.value)
                                    }
                                    className="w-[100px] border border-darkAccent/30 p-1 rounded-md"
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleConfirmColor}
                                    className="text-lightAccent px-3 transition duration-300 ease-in"
                                >
                                    Confirm Color
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-8">
                            {isGitHubConnected ? (
                                <Button
                                    variant="outline"
                                    onClick={handleDisconnectGitHub}
                                    className="text-lightAccent tracking-wide px-3 transition duration-300 ease-in flex items-center"
                                >
                                    <IconGitBranch className="mr-2" />
                                    Disconnect GitHub
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={handleGitHubConnect}
                                    className="text-lightAccent tracking-wide px-3 transition duration-300 ease-in flex items-center"
                                >
                                    <IconGitBranch className="mr-2" />
                                    Connect GitHub
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={handleSignOut}
                                className="text-lightAccent tracking-wide px-3 transition duration-300 ease-in flex items-center"
                            >
                                <IconLogout className="mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};
