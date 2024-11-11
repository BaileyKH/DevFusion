import { useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseDB';
import { UserContext } from '../App';
import axios from 'axios';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from '@/components/ui/button';

interface NewProjectProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

export const NewProject: React.FC<NewProjectProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [connectToGitHub, setConnectToGitHub] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = useContext(UserContext);
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState('');

  useEffect(() => {
    const fetchRepos = async () => {
      if (connectToGitHub) {
        const githubToken = localStorage.getItem('github_token');
        if (githubToken) {
          try {
            const response = await axios.get('https://api.github.com/user/repos', {
              headers: {
                Authorization: `token ${githubToken}`,
              },
            });
            setRepos(response.data);
          } catch (error) {
            console.error('Error fetching repos:', error);
          }
        } else {
          console.warn('GitHub token missing or connectToGitHub is false');
        }
      }
    };

    fetchRepos();
  }, [connectToGitHub]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      console.error('User not found in context');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('create_project_with_membership', {
        _name: projectName,
        _description: projectDescription,
        _owner_id: user.id,
      });

      if (error) {
        console.error('Error creating project:', error);
        alert(`Error creating project: ${error.message}`);
      } else if (data) {
        console.log('Project created successfully:', data);
        if (connectToGitHub && selectedRepo) {
          const { error: updateError } = await supabase
            .from('projects')
            .update({ github_repo_url: selectedRepo })
            .eq('id', data.id);

          if (updateError) {
            console.error('Error saving GitHub repository details to the project:', updateError);
            alert('Error saving GitHub repository details to the project.');
          } else {
            console.log('GitHub repository details saved successfully to the project.');
          }
        }

        onProjectCreated(data);
        onClose();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred while creating the project.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Create project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateProject}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label>Project Name</Label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label>Description</Label>
                <Input
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="connectToGitHub"
                  checked={connectToGitHub}
                  onCheckedChange={(checked) => setConnectToGitHub(checked === true)}
                />
                <Label htmlFor="connectToGitHub">
                  Connect GitHub Repo
                </Label>
              </div>
              {connectToGitHub && repos.length > 0 && (
                <div className="flex flex-col space-y-1.5">
                  <Label>Select Repository</Label>
                  <Select
                    value={selectedRepo}
                    onValueChange={(value) => setSelectedRepo(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Repo" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {repos.map((repo) => (
                        <SelectItem
                          key={repo.id}
                          value={`${repo.owner.login}/${repo.name}`}
                        >
                          {repo.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <CardFooter className="flex justify-between mt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
