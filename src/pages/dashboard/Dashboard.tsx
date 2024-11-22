// dashboard.tsx
import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../App';
import { supabase } from '../../supabaseDB';
import { NewProject } from '../../components/NewProject';
import { ProjectCard } from '../../components/ProjectCard';

import { Button } from "@/components/ui/button";
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
      <div className='flex justify-between items-center mb-8'>
        <h1 className="text-4xl font-extrabold text-primAccent">Your Projects</h1>
        <Button
          className="bg-gradient-to-r from-[#0398fc] to-[#00c6ff] px-6 py-3 text-lg font-semibold shadow-lg hover:scale-105 transform transition-transform duration-300"
          onClick={() => setIsModalOpen(true)}
        >
          New Project
        </Button>
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
