import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseDB';
import { memo, useContext, useState } from 'react';
import { UserContext } from '../App';

import { IconTrash } from '@tabler/icons-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useToast } from "@/hooks/use-toast"

interface ProjectCardProps {
  project: any;
  onDelete: (projectId: string) => void;
}

const ProjectCardComponent: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { toast } = useToast(); 
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // Fetch the current user's role in the project_memberships table
      const { data: membership, error: membershipFetchError } = await supabase
        .from('project_memberships')
        .select('role')
        .eq('project_id', project.id)
        .eq('user_id', user.id)
        .single();

      if (membershipFetchError || !membership) {
        toast({
          title: "Error",
          description: "Error fetching membership details. Please try again.",
          variant: "destructive",
        });
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
          toast({
            title: "Error",
            description: "Error deleting project memberships.",
            variant: "destructive",
          });
          return;
        }

        // Delete the project itself
        const { error: projectDeleteError } = await supabase
          .from('projects')
          .delete()
          .eq('id', project.id);

        if (projectDeleteError) {
          toast({
            title: "Error",
            description: "Error deleting the project.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Project deleted successfully.",
        });
        onDelete(project.id);
      } else {
        // User is a collaborator, only remove their membership
        const { error: membershipDeleteError } = await supabase
          .from('project_memberships')
          .delete()
          .eq('project_id', project.id)
          .eq('user_id', user.id);

        if (membershipDeleteError) {
          toast({
            title: "Error",
            description: "Error removing you from the project.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "You have been removed from the project successfully.",
        });
        onDelete(project.id);
      }
    } catch (error) {
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while deleting the project.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <IconTrash
                  stroke={1}
                  onClick={(e) => {
                    e.stopPropagation(); 
                  }}
                  className="absolute bottom-4 right-4 text-primAccent h-6 w-6 transition duration-300 hover:text-red-500"
                />
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Project</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the project "{project.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className='text-lightAccent'>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export const ProjectCard = memo(ProjectCardComponent);
