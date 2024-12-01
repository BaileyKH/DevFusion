import { useEffect, useState, useContext } from "react";
import { UserContext } from "../App";
import { supabase } from "../supabaseDB";
import axios from "axios";
import { useParams } from "react-router-dom";
import ShineBorder from "@/components/ui/shine-border";

import { motion } from "framer-motion";
import { IconGitCommit } from "@tabler/icons-react";

const ChangeLog = () => {
    const { user } = useContext(UserContext);
    const { projectId } = useParams<{ projectId: string }>();
    const [commits, setCommits] = useState([]);
    const [githubRepoUrl, setGithubRepoUrl] = useState("");
    const githubToken = user.github_token;

    // Fetch project information to get GitHub repo URL
    const fetchProject = async () => {
        const { data, error } = await supabase
            .from("projects")
            .select("github_repo_url")
            .eq("id", projectId)
            .single();

        if (error) {
            console.error("Error fetching project:", error);
        } else {
            setGithubRepoUrl(data.github_repo_url);
        }
    };

    // Fetch commits for the GitHub repository
    const fetchCommits = async () => {
        if (!githubRepoUrl || !githubToken) return;

        try {
            const response = await axios.get(
                "https://defusion-be.onrender.com/api/github/commits",
                {
                    params: {
                        repoUrl: githubRepoUrl,
                        githubToken: githubToken,
                    },
                }
            );
            setCommits(response.data);
        } catch (error) {
            console.error("Error fetching commits:", error);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [projectId]);

    useEffect(() => {
        if (githubRepoUrl) {
            fetchCommits();
        }
    }, [githubRepoUrl]);

    return (
        <div className="p-4 md:p-8 w-full min-h-screen">
            <div className="max-w-6xl mx-auto">
                <motion.h1
                    className="text-3xl md:text-4xl font-bold text-lightAccent mb-6 md:mb-8 text-center"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    Change Log
                </motion.h1>
                {commits.length === 0 ? (
                    <motion.div
                        className="flex flex-col items-center justify-center py-16 md:py-24"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <IconGitCommit className="h-16 w-16 md:h-20 md:w-20 text-primAccent mb-4" />
                        <h2 className="text-xl md:text-2xl font-semibold text-lightAccent">
                            No commits found for this repository
                        </h2>
                        <p className="text-lightAccent/70 mt-2">
                            Make your first commit to get started!
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        className="bg-primDark/80 rounded-lg shadow-lg overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <ShineBorder
                            borderWidth={2}
                            color={"#0398fc"}
                            className="w-full"
                        >
                            <div className="p-6 space-y-4 w-full">
                                {commits.map((commit: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: index * 0.1,
                                            duration: 0.5,
                                        }}
                                        className="bg-darkAccent/30 rounded-lg p-4 mb-4 shadow-md hover:shadow-lg transition duration-300"
                                    >
                                        <div className="flex items-center mb-2">
                                            <IconGitCommit className="text-primAccent mr-3" />
                                            <h3 className="font-bold text-lightAccent">
                                                {commit.commit.author.name}
                                            </h3>
                                        </div>
                                        <p className="text-lightAccent/85 text-sm mb-1">
                                            <strong className="text-lightAccent">
                                                Date:
                                            </strong>{" "}
                                            {new Date(
                                                commit.commit.author.date
                                            ).toLocaleDateString()}
                                        </p>
                                        <p className="text-lightAccent/85 text-sm mb-2">
                                            <strong className="text-lightAccent">
                                                Message:
                                            </strong>{" "}
                                            {commit.commit.message}
                                        </p>
                                        <a
                                            href={commit.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primAccent text-sm underline hover:text-lightAccent transition duration-300"
                                        >
                                            View Commit
                                        </a>
                                    </motion.div>
                                ))}
                            </div>
                        </ShineBorder>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ChangeLog;
