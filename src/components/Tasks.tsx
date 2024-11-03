import { useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseDB';
import { UserContext } from '../App';
import { useParams } from 'react-router-dom';

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
}

export const Tasks = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const user = useContext(UserContext);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [newTask, setNewTask] = useState<string>('');

  // Fetch project members
  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('project_memberships')
        .select('user_id, users(username)')
        .eq('project_id', projectId);
      
      if (error) {
        console.error('Error fetching members:', error);
      } else {
        const membersData = data.map((item: any) => ({
          id: item.user_id,
          username: item.users.username,
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
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching tasks:', error);
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
      .from('tasks')
      .insert({
        project_id: projectId,
        user_id: userId,
        description: newTask.trim(),
        is_completed: false,
      })
      .select();

    if (error) {
      console.error('Error adding task:', error);
    } else if (data) {
      setTasks((prevTasks) => [...prevTasks, ...data]);
      setNewTask('');
    }
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !isCompleted })
      .eq('id', taskId)
      .eq('user_id', user.id); // Ensure users can only update their own tasks

    if (error) {
      console.error('Error updating task:', error);
    } else {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, is_completed: !isCompleted } : task
        )
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id); // Ensure users can only delete their own tasks

    if (error) {
      console.error('Error deleting task:', error);
    } else {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {members.map((member) => (
        <div key={member.id} className="flex-shrink-0 w-1/4 p-4 bg-primDark border border-gray-300 rounded-md">
          <h2 className="font-bold mb-2">{member.username}</h2>
          <ul>
            {tasks
              .filter((task) => task.user_id === member.id)
              .map((task) => (
                <li key={task.id} className="mb-2">
                  <input
                    type="checkbox"
                    checked={task.is_completed}
                    onChange={() => handleToggleTask(task.id, task.is_completed)}
                    disabled={task.user_id !== user.id}
                  />
                  <span className={`ml-2 ${task.is_completed ? 'line-through' : ''}`}>
                    {task.description}
                  </span>
                  {task.user_id === user.id && (
                    <button
                      className="ml-4 text-red-500"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
          </ul>
          {member.id === user.id && (
            <form onSubmit={(e) => handleAddTask(e, member.id)}>
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="New Task"
                className="w-full p-2 border border-gray-400 rounded mt-2"
              />
              <button type="submit" className="mt-2 p-2 bg-primAccent text-white rounded">
                Add Task
              </button>
            </form>
          )}
        </div>
      ))}
    </div>
  );
};
