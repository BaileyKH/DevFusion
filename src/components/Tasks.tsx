import { useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseDB';
import { UserContext } from '../App';
import { useParams } from 'react-router-dom';

import { IconPlus, IconUserCircle, IconTrash } from '@tabler/icons-react';

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

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
  const user = useContext(UserContext);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [newTask, setNewTask] = useState<string>('');

  // Fetch project members
  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('project_memberships')
        .select('*, users(*)')
        .eq('project_id', projectId);
      
      if (error) {
        console.error('Error fetching members:', error);
      } else {
        const membersData = data.map((item: any) => ({
          id: item.user_id,
          username: item.users.username,
          avatar_url: item.users.avatar_url
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
      .eq('user_id', user.id); 

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
      .eq('user_id', user.id); 

    if (error) {
      console.error('Error deleting task:', error);
    } else {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8 my-4 h-screen">
      {members.map((member) => (
        <div key={member.id} className="overflow-hidden rounded-xl border border-darkAccent/65 ">
          <div className='flex flex-col justify-center bg-secDark p-4 nav-gradient'>
            <div className='flex items-end mb-4 gap-x-4'>
              {member.avatar_url ? (
                <img src={member.avatar_url} className="h-10 w-10 rounded-full"/> ) : (
                <IconUserCircle stroke={1} className="h-10 w-10 rounded-full"/>
              )}
              <h2 className="font-bold mb-2">{member.username}</h2>
            </div>
            {member.id === user.id && (
              <form onSubmit={(e) => handleAddTask(e, member.id)} className='flex'>
                <Input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="New Task"
                  className='w-64 placeholder:text-darkAccent/65 border-darkAccent/65'
                />
                <button type="submit">
                  <IconPlus stroke={2} className='text-primAccent w-[6] h-[6] ml-3 border border-primAccent rounded-md hover:bg-red-200 transition-colors duration-200 ease-in'/>
                </button>
              </form>
            )}
          </div>
          <ul className='bg-primDark p-4 h-full'>
            {tasks
              .filter((task) => task.user_id === member.id)
              .map((task) => (
                <li key={task.id} className="flex justify-between items-center mb-2">
                  <div className='flex items-center'>
                    <Checkbox
                      onCheckedChange={() => handleToggleTask(task.id, task.is_completed)}
                      checked={task.is_completed}
                      disabled={task.user_id !== user.id}
                    />
                    <span className={`ml-2 ${task.is_completed ? 'line-through' : ''}`}>
                      {task.description}
                    </span>
                  </div>
                  {task.user_id === user.id && (
                    <button
                      className="ml-4 text-red-500"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <IconTrash stroke={1} />
                    </button>
                  )}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Tasks;