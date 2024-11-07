import { useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseDB';
import { UserContext } from '../App';
import axios from 'axios';

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
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
        <form onSubmit={handleCreateProject}>
          <div className="mb-4">
            <label className="block text-gray-700">Project Name</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Description</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              required
            />
          </div>
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              checked={connectToGitHub}
              onChange={(e) => setConnectToGitHub(e.target.checked)}
              className="mr-2"
            />
            <label className="text-gray-700">Connect to GitHub</label>
          </div>
          {connectToGitHub && repos.length > 0 && (
            <div className="mb-4">
              <label className="block text-gray-700">Select Repository</label>
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              >
                <option value="">Select a repository</option>
                {repos.map((repo) => (
                  <option key={repo.id} value={`${repo.owner.login}/${repo.name}`}>
                    {repo.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="p-2 bg-gray-300 rounded"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
