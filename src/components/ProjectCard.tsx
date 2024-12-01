import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseDB";
import { memo, useContext, useState } from "react";
import { UserContext } from "../App";

import { IconTrash, IconGitBranch } from "@tabler/icons-react";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
    project: any;
    onDelete: (projectId: string) => void;
}

const ProjectCardComponent: React.FC<ProjectCardProps> = ({
    project,
    onDelete,
}) => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleClick = () => {
        navigate(`/projects/${project.id}`);
    };

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            // Fetch the current user's role in the project_memberships table
            const { data: membership, error: membershipFetchError } =
                await supabase
                    .from("project_memberships")
                    .select("role")
                    .eq("project_id", project.id)
                    .eq("user_id", user.id)
                    .single();

            if (membershipFetchError || !membership) {
                toast({
                    title: "Error",
                    description:
                        "Error fetching membership details. Please try again.",
                    variant: "destructive",
                });
                return;
            }

            // Check the role of the current user in this project
            const userRole = membership.role;

            if (userRole === "owner") {
                // Delete all project memberships
                const { error: membershipDeleteError } = await supabase
                    .from("project_memberships")
                    .delete()
                    .eq("project_id", project.id);

                if (membershipDeleteError) {
                    toast({
                        title: "Error",
                        description: "Error deleting project memberships.",
                        variant: "destructive",
                    });
                    return;
                }

                // Delete the project itself
                const { error: projectDeleteError } = await supabase
                    .from("projects")
                    .delete()
                    .eq("id", project.id);

                if (projectDeleteError) {
                    toast({
                        title: "Error",
                        description: "Error deleting the project.",
                        variant: "destructive",
                    });
                    return;
                }

                toast({
                    title: "Success",
                    description: "Project deleted successfully.",
                });
                onDelete(project.id);
            } else {
                // User is a collaborator, only remove their membership
                const { error: membershipDeleteError } = await supabase
                    .from("project_memberships")
                    .delete()
                    .eq("project_id", project.id)
                    .eq("user_id", user.id);

                if (membershipDeleteError) {
                    toast({
                        title: "Error",
                        description: "Error removing you from the project.",
                        variant: "destructive",
                    });
                    return;
                }

                toast({
                    title: "Success",
                    description:
                        "You have been removed from the project successfully.",
                });
                onDelete(project.id);
            }
        } catch (error) {
            toast({
                title: "Unexpected Error",
                description:
                    "An unexpected error occurred while deleting the project.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <motion.div
            className={cn(
                "relative group overflow-hidden rounded-3xl transition-transform duration-500 cursor-pointer w-full",
                "hover:shadow-[0px_30px_60px_rgba(0,0,0,0.5)]"
            )}
            onClick={handleClick}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#0398fc] to-[#00c6ff] opacity-40 z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 1 }}
            />
            <Card className="relative w-full h-[300px] overflow-hidden rounded-3xl z-10 bg-[#1a1a1a]/90 border border-primAccent/20 shadow-lg transition-transform duration-300 hover:shadow-xl">
                <CardHeader className="p-6">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-3xl font-bold text-lightAccent">
                            {project.name}
                        </CardTitle>
                        <div className="flex items-center">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <IconTrash
                                        stroke={1.5}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        className="text-red-500 h-6 w-6 transition-transform transform hover:scale-110"
                                    />
                                </AlertDialogTrigger>
                                <AlertDialogContent
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-primAccent">
                                            Delete Project
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete the
                                            project "{project.name}"? This
                                            action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="text-lightAccent">
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting
                                                ? "Deleting..."
                                                : "Delete"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-6">
                    <p className="text-lightAccent/85 leading-relaxed">
                        {project.description}
                    </p>
                </CardContent>
                {project.github_repo_url && (
                    <CardFooter className="p-6 mt-auto">
                        <IconGitBranch
                            stroke={1.5}
                            className="text-primAccent h-6 w-6 mr-2"
                        />
                        <p className="text-lightAccent/60">
                            <strong className="text-lightAccent/85">
                                Repo:
                            </strong>{" "}
                            {project.github_repo_url}
                        </p>
                    </CardFooter>
                )}
            </Card>
        </motion.div>
    );
};

export const ProjectCard = memo(ProjectCardComponent);
