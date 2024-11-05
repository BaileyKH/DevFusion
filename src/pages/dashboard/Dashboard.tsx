import { useState, useEffect, useContext } from 'react';

import { UserContext } from '../../App';
import { supabase } from '../../supabaseDB';

import { NewProject } from '../../components/NewProject';
import { ProjectCard } from '../../components/ProjectCard';

export const Dashboard = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useContext(UserContext);

  const fetchProjects = async () => {
    if (!user) {
      console.error('No user found in context');
      return;
    }

    const { data, error } = await supabase
      .from('user_projects')
      .select('id, name, description, github_repo_url');

    if (error) {
      console.error('Error fetching projects:', error);
      alert(`Error fetching projects: ${error.message}`);
    } else {
      console.log('User projects fetched:', data);
      setProjects(data);
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

  console.log('Projects:', projects);


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Projects</h1>
      <button
        className="mb-4 p-2 bg-blue-500 text-white rounded"
        onClick={() => setIsModalOpen(true)}
      >
        + New Project
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
