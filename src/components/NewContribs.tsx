import { useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseDB';
import { UserContext } from '../App';
import { useParams } from 'react-router-dom';
import { AddContribs } from './AddContribs';

export const NewContribs = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useContext(UserContext);
  const [project, setProject] = useState<any>(null);

  if (!projectId) {
    return <p>Invalid project ID.</p>;
  }

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, owner_id')
        .eq('id', projectId)
        .single();

      if (error) {
        console.error('Error fetching project:', error);
      } else {
        setProject(data);
      }
    };

    fetchProject();
  }, [projectId]);

  if (!project) {
    return <p>Loading project...</p>;
  }

  return (
    <div className='my-4'>
      <h1>{project.name}</h1>
      {user && user.id === project.owner_id && <AddContribs projectId={projectId} />}
    </div>
  );
};
