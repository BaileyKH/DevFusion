import { useState, useEffect, useContext } from "react";
import { supabase } from "../supabaseDB";
import { UserContext } from "../App";
import { useParams } from "react-router-dom";

import { IconPlus, IconUserCircle, IconTrash } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface Task {
    id: string;
    project_id: string;
    user_id: string;
    description: string;
    is_completed: boolean;
    created_at: string;
}

interface ProjectMember {
    id: string;
    username: string;
    avatar_url: string;
}

const Tasks = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { user } = useContext(UserContext);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [newTask, setNewTask] = useState<string>("");

    // Fetch project members
    useEffect(() => {
        const fetchMembers = async () => {
            const { data, error } = await supabase
                .from("project_memberships")
                .select("*, users(*)")
                .eq("project_id", projectId);

            if (error) {
                console.error("Error fetching members:", error);
            } else {
                const membersData = data.map((item: any) => ({
                    id: item.user_id,
                    username: item.users.username,
                    avatar_url: item.users.avatar_url,
                }));
                setMembers(membersData);
            }
        };

        fetchMembers();
    }, [projectId]);

    // Fetch tasks for individual project
    useEffect(() => {
        const fetchTasks = async () => {
            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .eq("project_id", projectId);

            if (error) {
                console.error("Error fetching tasks:", error);
            } else {
                setTasks(data);
            }
        };

        fetchTasks();
    }, [projectId]);

    const handleAddTask = async (e: React.FormEvent, userId: string) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        const { data, error } = await supabase
            .from("tasks")
            .insert({
                project_id: projectId,
                user_id: userId,
                description: newTask.trim(),
                is_completed: false,
            })
            .select();

        if (error) {
            console.error("Error adding task:", error);
        } else if (data) {
            setTasks((prevTasks) => [...prevTasks, ...data]);
            setNewTask("");
        }
    };

    const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
        const { error } = await supabase
            .from("tasks")
            .update({ is_completed: !isCompleted })
            .eq("id", taskId)
            .eq("user_id", user.id);

        if (error) {
            console.error("Error updating task:", error);
        } else {
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId
                        ? { ...task, is_completed: !isCompleted }
                        : task
                )
            );
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        const { error } = await supabase
            .from("tasks")
            .delete()
            .eq("id", taskId)
            .eq("user_id", user.id);

        if (error) {
            console.error("Error deleting task:", error);
        } else {
            setTasks((prevTasks) =>
                prevTasks.filter((task) => task.id !== taskId)
            );
        }
    };

    return (
        <div className="w-full min-h-screen p-6 text-lightAccent">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-10">
                {members.map((member) => (
                    <Card
                        key={member.id}
                        className="rounded-xl border border-lightAccent/10 bg-gradient-to-br from-primDark to-primDark/60 p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                        <CardHeader className="flex items-center mb-6">
                            {member.avatar_url ? (
                                <img
                                    src={member.avatar_url}
                                    alt={`${member.username}'s avatar`}
                                    className="h-12 w-12 rounded-full mr-4 shadow-md"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-400 text-primAccent">
                                    <IconUserCircle size={32} />
                                </div>
                            )}
                            <CardTitle className="text-2xl font-bold text-lightAccent">
                                {member.username}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {member.id === user.id && (
                                <form
                                    onSubmit={(e) =>
                                        handleAddTask(e, member.id)
                                    }
                                    className="flex items-center space-x-4"
                                >
                                    <Input
                                        type="text"
                                        value={newTask}
                                        onChange={(e) =>
                                            setNewTask(e.target.value)
                                        }
                                        placeholder="Add new task"
                                        className="flex-grow text-lightAccent placeholder:text-darkAccent/70 border border-darkAccent/60"
                                    />
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        className="p-2 hover:bg-primAccent hover:text-darkAccent transition-all"
                                    >
                                        <IconPlus size={20} />
                                    </Button>
                                </form>
                            )}

                            <ul className="space-y-2 mt-6">
                                {tasks
                                    .filter(
                                        (task) => task.user_id === member.id
                                    )
                                    .map((task) => (
                                        <li
                                            key={task.id}
                                            className="flex items-center justify-between p-2 bg-darkAccent/10 rounded-lg shadow-sm hover:bg-darkAccent/20 transition-colors duration-200"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    onCheckedChange={() =>
                                                        handleToggleTask(
                                                            task.id,
                                                            task.is_completed
                                                        )
                                                    }
                                                    checked={task.is_completed}
                                                    disabled={
                                                        task.user_id !== user.id
                                                    }
                                                    className="text-primAccent"
                                                />
                                                <span
                                                    className={`text-lightAccent ${
                                                        task.is_completed
                                                            ? "line-through opacity-60"
                                                            : ""
                                                    }`}
                                                >
                                                    {task.description}
                                                </span>
                                            </div>
                                            {task.user_id === user.id && (
                                                <button
                                                    className="text-primAccent hover:text-red-500 transition-colors duration-200"
                                                    onClick={() =>
                                                        handleDeleteTask(
                                                            task.id
                                                        )
                                                    }
                                                >
                                                    <IconTrash size={18} />
                                                </button>
                                            )}
                                        </li>
                                    ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Tasks;
