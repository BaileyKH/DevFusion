import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseDB';

export const ProjectDashboard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      const { data: projectData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error || !projectData) {
        console.error('Error fetching project:', error);
        alert('You do not have access to this project.');
        navigate('/dashboard'); 
      } else {
        setProject(projectData);
      }
      setLoading(false);
    };

    fetchProject();
  }, [projectId, navigate]);

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{project.name}</h1>
      <p>{project.description}</p>
      {/* Add tabs and project-specific components here */}
    </div>
  );
};