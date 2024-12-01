import { useState, useContext, useEffect } from "react";
import { supabase } from "../supabaseDB";
import { UserContext } from "../App";
import axios from "axios";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface NewProjectProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectCreated: (project: any) => void;
}

export const NewProject: React.FC<NewProjectProps> = ({
    isOpen,
    onClose,
    onProjectCreated,
}) => {
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [connectToGitHub, setConnectToGitHub] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useContext(UserContext);
    const [repos, setRepos] = useState<any[]>([]);
    const [selectedRepo, setSelectedRepo] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        const fetchRepos = async () => {
            if (connectToGitHub && user && user.github_token) {
                const githubToken = user.github_token;
                if (githubToken) {
                    try {
                        const response = await axios.get(
                            "https://api.github.com/user/repos",
                            {
                                headers: {
                                    Authorization: `token ${githubToken}`,
                                },
                            }
                        );
                        setRepos(response.data);
                    } catch (error) {
                        console.error("Error fetching repos:", error);
                        setRepos([]);
                    }
                } else {
                    console.warn(
                        "GitHub token missing or connectToGitHub is false"
                    );
                    setRepos([]);
                }
            }
        };

        fetchRepos();
    }, [connectToGitHub, user]);

    // Clear the repos and selectedRepo when user disconnects GitHub
    useEffect(() => {
        if (!user || !user.github_token) {
            setRepos([]);
            setSelectedRepo("");
            setConnectToGitHub(false);
        }
    }, [user]);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!user) {
            console.error("User not found in context");
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.rpc(
                "create_project_with_membership",
                {
                    _name: projectName,
                    _description: projectDescription,
                    _owner_id: user.id,
                }
            );

            if (error) {
                toast({
                    title: "Error",
                    description: "Error creating project.",
                    variant: "destructive",
                });
                return;
            } else if (data) {
                toast({
                    title: "Success",
                    description: "Project created successfully.",
                });
                if (connectToGitHub && selectedRepo) {
                    const { error: updateError } = await supabase
                        .from("projects")
                        .update({ github_repo_url: selectedRepo })
                        .eq("id", data.id);

                    if (updateError) {
                        console.error(
                            "Error saving GitHub repository details to the project:",
                            updateError
                        );
                        alert(
                            "Error saving GitHub repository details to the project."
                        );
                    } else {
                        console.log(
                            "GitHub repository successfully added to the project."
                        );
                    }
                }

                onProjectCreated(data);
                onClose();
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            alert("An unexpected error occurred while creating the project.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <Card className="w-[350px] border-darkAccent/30">
                <CardHeader>
                    <CardTitle>Create project</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateProject}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label>Project Name</Label>
                                <Input
                                    value={projectName}
                                    onChange={(e) =>
                                        setProjectName(e.target.value)
                                    }
                                    className="border-darkAccent/30"
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label>Description</Label>
                                <Input
                                    value={projectDescription}
                                    onChange={(e) =>
                                        setProjectDescription(e.target.value)
                                    }
                                    className="border-darkAccent/30"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="connectToGitHub"
                                    checked={connectToGitHub}
                                    onCheckedChange={(checked) =>
                                        setConnectToGitHub(checked === true)
                                    }
                                    disabled={!user?.github_token}
                                />
                                <Label htmlFor="connectToGitHub">
                                    Connect GitHub Repo
                                </Label>
                            </div>
                            {connectToGitHub && repos.length > 0 && (
                                <div className="flex flex-col space-y-1.5">
                                    <Label>Select Repository</Label>
                                    <Select
                                        value={selectedRepo}
                                        onValueChange={(value) =>
                                            setSelectedRepo(value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Repo" />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            {repos.map((repo) => (
                                                <SelectItem
                                                    key={repo.id}
                                                    value={`${repo.owner.login}/${repo.name}`}
                                                >
                                                    {repo.full_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <CardFooter className="flex justify-between mt-4">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="transition duration-300 ease-in"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="transition duration-300 ease-in"
                            >
                                {loading ? "Creating..." : "Create"}
                            </Button>
                        </CardFooter>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
