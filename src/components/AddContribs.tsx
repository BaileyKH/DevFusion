import { useState, useContext } from 'react';
import { supabase } from '../supabaseDB';
import { UserContext } from '../App';

interface AddContributorProps {
    projectId: string;
  }

  export const AddContribs = ({ projectId }: AddContributorProps) => {
  const user = useContext(UserContext);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email')
      .or(`username.ilike.%${usernameOrEmail}%,email.ilike.%${usernameOrEmail}%`);
  
    if (error) {
      setError('Error searching users.');
    } else {
      setSearchResults(data || []);
    }
  };
  
  const handleAddContributor = async (userId: string) => {
    const { data: existingMembership } = await supabase
      .from('project_memberships')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();
  
    if (existingMembership) {
      setError('User is already a contributor.');
      return;
    }

    const { error } = await supabase.from('project_memberships').insert({
      project_id: projectId,
      user_id: userId,
    });
  
    if (error) {
      setError('Error adding contributor.');
    } else {
      setError('Contributor added successfully!');
    }
  };

  return (
    <div className="">
      <h2>Add Contributors</h2>
      <input
        type="text"
        placeholder="Search by username or email"
        value={usernameOrEmail}
        onChange={(e) => setUsernameOrEmail(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      {error && <p className="error">{error}</p>}
      <ul>
        {searchResults.map((result) => (
          <li key={result.id}>
            {result.username}
            <button onClick={() => handleAddContributor(result.id)}>Add</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
