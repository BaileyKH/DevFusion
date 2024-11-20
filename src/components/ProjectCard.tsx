import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseDB';
import { memo, useContext } from 'react';
import { UserContext } from '../App';

import { IconTrash } from '@tabler/icons-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProjectCardProps {
  project: any;
  onDelete: (projectId: string) => void;
}

const ProjectCardComponent: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

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
      // Fetch the current user's role in the project_memberships table
      const { data: membership, error: membershipFetchError } = await supabase
        .from('project_memberships')
        .select('role')
        .eq('project_id', project.id)
        .eq('user_id', user.id)
        .single();

      if (membershipFetchError || !membership) {
        alert('Error fetching membership details. Please try again.');
        return;
      }

      // Check the role of the current user in this project
      const userRole = membership.role;

      if (userRole === 'owner') {
  
        // Delete all project memberships
        const { error: membershipDeleteError } = await supabase
          .from('project_memberships')
          .delete()
          .eq('project_id', project.id);
      
        if (membershipDeleteError) {
          alert('Error deleting project memberships.');
          return;
        }
      
        // Delete the project itself
        const { error: projectDeleteError } = await supabase
          .from('projects')
          .delete()
          .eq('id', project.id);
      
        if (projectDeleteError) {
          alert('Error deleting the project.');
          return;
        }
      
        alert('Project deleted successfully.');
        onDelete(project.id);
      } else {
        // User is a collaborator, only remove their membership
        const { error: membershipDeleteError } = await supabase
          .from('project_memberships')
          .delete()
          .eq('project_id', project.id)
          .eq('user_id', user.id);
      
        if (membershipDeleteError) {
          alert('Error removing you from the project.');
          return;
        }
      
        alert('You have been removed from the project successfully.');
        onDelete(project.id);
      }
    } catch (error) {
      alert('An unexpected error occurred while deleting the project.');
    }
  };

  return (
    <div
      className="hover:scale-105 transform transition duration-300 cursor-pointer relative w-full"
      onClick={handleClick}
    >
      <div className='rounded-lg w-full project-card-shadow'>
        <Card className='w-full h-[250px] border-none'>
          <CardHeader>
            <CardTitle className='text-primAccent text-lg font-bold tracking-wide'>{project.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-lightAccent/85'>{project.description}</p>
          </CardContent>
          <CardFooter>
            {project.github_repo_url && (
              <p className="text-lightAccent/60 mt-16">
                <strong className='text-lightAccent/85'>Repo:</strong> {project.github_repo_url}
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
