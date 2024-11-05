import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseDB';

interface ProjectCardProps {
  project: any;
  onDelete: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click event from navigating to the project
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      // Delete all related data first before deleting the project itself

      // Delete related tasks
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', project.id);

      if (tasksError) {
        console.error('Error deleting tasks:', tasksError);
        alert('Error deleting tasks related to the project.');
        return;
      }

      // Delete related project memberships
      const { error: membershipsError } = await supabase
        .from('project_memberships')
        .delete()
        .eq('project_id', project.id);

      if (membershipsError) {
        console.error('Error deleting project memberships:', membershipsError);
        alert('Error deleting memberships related to the project.');
        return;
      }

      // Delete the project itself
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (projectError) {
        console.error('Error deleting project:', projectError);
        alert('Error deleting the project.');
        return;
      }

      // Notify the parent component that the project was deleted
      onDelete(project.id);
    } catch (error) {
      console.error('Unexpected error deleting project:', error);
      alert('An unexpected error occurred while deleting the project.');
    }
  };

  return (
    <div
      className="border p-4 rounded shadow hover:shadow-lg cursor-pointer relative"
      onClick={handleClick}
    >
      <h2 className="text-xl font-semibold">{project.name}</h2>
      <p>{project.description}</p>
      {project.github_repo_url && (
        <p className="text-gray-600 mt-2">
          <strong>Repo:</strong> {project.github_repo_url}
        </p>
      )}
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
      >
        Delete
      </button>
    </div>
  );
};
