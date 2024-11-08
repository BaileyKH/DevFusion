import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseDB';
import { memo } from 'react';

interface ProjectCardProps {
  project: any;
  onDelete: (projectId: string) => void;
}

const ProjectCardComponent: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
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
      // Delete related tasks, memberships, and project itself
      const { error: projectError } = await supabase.from('projects').delete().eq('id', project.id);

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
      className="m-8 border border-darkAccent p-4 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transform transition duration-300 cursor-pointer relative bg-radial-bg h-48"
      onClick={handleClick}
    >
      <h2 className="text-xl font-semibold text-white">{project.name}</h2>
      <p className="text-sm font-light text-lightAccent">{project.description}</p>
      {project.github_repo_url && (
        <p className="text-lightAccent mt-16">
          <strong className='text-white'>Repo:</strong> {project.github_repo_url}
        </p>
      )}
      <button
        onClick={handleDelete}
        className="absolute top-4 right-4 bg-primAccent text-white px-2 py-1 rounded-full transition duration-300 hover:bg-red-950"
      >
        Delete
      </button>
    </div>
  );
};

export const ProjectCard = memo(ProjectCardComponent);
