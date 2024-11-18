import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseDB';
import { memo } from 'react';

import { IconTrash } from '@tabler/icons-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
    e.stopPropagation(); 
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
      className="hover:scale-105 transform transition duration-300 cursor-pointer relative w-full"
      onClick={handleClick}
    >
      <div className='border border-darkAccent/65 hover:border-primAccent/65 rounded-lg w-full'>
        <Card className='w-full h-[250px] border-none'>
          <CardHeader>
            <CardTitle className='text-primAccent'>{project.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-lightAccent/70'>{project.description}</p>
          </CardContent>
          <CardFooter>
            {project.github_repo_url && (
              <p className="text-lightAccent/70 mt-16">
                <strong className='text-lightAccent'>Repo:</strong> {project.github_repo_url}
              </p>
            )}
            <IconTrash
              stroke={1}
              onClick={handleDelete}
              className="absolute bottom-4 right-4 text-primAccent h-6 w-6 transition duration-300 hover:text-red-500"
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export const ProjectCard = memo(ProjectCardComponent);



