import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../App';
import { supabase } from '../../supabaseDB';
import { NewProject } from '../../components/NewProject';
import { ProjectCard } from '../../components/ProjectCard';

const Dashboard = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useContext(UserContext);
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);

  useEffect(() => {
    const githubToken = localStorage.getItem('github_token');
    if (githubToken) {
      fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${githubToken}`,
        },
      })
        .then(response => {
          if (response.ok) {
            setIsGitHubConnected(true);
          } else {
            console.warn('GitHub token is expired or invalid.');
            setIsGitHubConnected(false);
          }
        })
        .catch(() => setIsGitHubConnected(false));
    } else {
      setIsGitHubConnected(false);
    }
  }, []);

  const fetchProjects = async () => {
    if (!user) {
      console.error('No user found in context');
      return;
    }

    const { data, error } = await supabase
      .from('user_projects')
      .select('id, name, description, github_repo_url')

    if (error) {
      console.error('Error fetching projects:', error);
      alert(`Error fetching projects: ${error.message}`);
    } else {
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

  return (
    <div className="p-4">
      <div className='flex justify-between items-center'>
        <h1 className="text-2xl font-bold mb-4 text-lightAccent">Your Projects</h1>
        {!isGitHubConnected && (
          <button
            className="mb-4 p-2 bg-green-500 text-white rounded"
            onClick={() =>
              window.location.href = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&scope=repo`
            }
          >
            Connect to GitHub
          </button>
        )}
        <button
          className="mb-4 p-2 bg-primAccent hover:bg-red-950 transition duration-300 text-lightAccent rounded"
          onClick={() => setIsModalOpen(true)}
        >
          New Project
        </button>
      </div>
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

export default Dashboard;
