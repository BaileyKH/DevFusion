// dashboard.tsx
import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../App';
import { supabase } from '../../supabaseDB';
import { NewProject } from '../../components/NewProject';
import { ProjectCard } from '../../components/ProjectCard';

import { useToast } from "@/hooks/use-toast"

const Dashboard = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useContext(UserContext);
  const { toast } = useToast();

  const fetchProjects = async () => {
    if (!user) {
      console.error('No user found in context');
      return;
    }

    // Fetch project memberships for the current user
    const { data: memberships, error: membershipsError } = await supabase
      .from('project_memberships')
      .select('project_id')
      .eq('user_id', user.id);

    if (membershipsError) {
      console.error('Error fetching memberships:', membershipsError);
      return;
    }

    if (memberships && memberships.length > 0) {
      const projectIds = memberships.map((membership) => membership.project_id);

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, description, github_repo_url')
        .in('id', projectIds); 

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        toast({
          title: "Error",
          description: "Error fetching projects",
          variant: "destructive",
        });
        return;
      } else {
        setProjects(projectsData);
      }
    } else {
      setProjects([]);
    }
  };

  const handleProjectCreated = (project: any) => {
    if (project && project.id) {
      setProjects((prevProjects) => [...prevProjects, project]);
    } else {
      console.error('Invalid project object:', project);
    }
  };

  const handleProjectDeleted = (projectId: string) => {
    setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  return (
    <div className="p-4 h-full">
      <div className='flex justify-between items-center'>
        <h1 className="text-2xl font-bold mb-4 text-lightAccent/85">Your Projects</h1>
        <button
          className="mb-4 p-2 bg-primAccent hover:bg-blue-800 transition duration-300 text-lightAccent rounded"
          onClick={() => setIsModalOpen(true)}
        >
          New Project
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onDelete={handleProjectDeleted} />
        ))}
      </div>
      <NewProject
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default Dashboard;
