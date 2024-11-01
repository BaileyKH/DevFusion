import { useState, useContext } from 'react';
import { supabase } from '../supabaseDB';

import { UserContext } from '../App';

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
    const [loading, setLoading] = useState(false);
    const user = useContext(UserContext);
  
    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
      
        if (!user) {
          console.error('User not found in context');
          setLoading(false);
          return;
        }
      
        const { data, error } = await supabase.rpc('create_project_with_membership', {
          _name: projectName,
          _description: projectDescription,
          _owner_id: user.id,
        });
      
        if (error) {
          console.error('Error creating project:', error);
          alert(`Error creating project: ${error.message}`);
        } else {
          console.log('Project created:', data);
          onProjectCreated(data); 
          onClose();
        }
        setLoading(false);
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