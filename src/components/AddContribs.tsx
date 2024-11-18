import { useState } from 'react';
import { supabase } from '../supabaseDB';

import { IconPlus } from '@tabler/icons-react';

import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button';

interface AddContributorProps {
    projectId: string;
  }

  export const AddContribs = ({ projectId }: AddContributorProps) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, avatar_url')
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
    <div className="mx-auto max-w-lg">
      <div>
        <div className="text-center">
          <svg
            fill="none"
            stroke="#931621"
            viewBox="0 0 48 48"
            aria-hidden="true"
            className="mx-auto h-12 w-12 text-gray-400"
          >
            <path
              d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h2 className="mt-2 text-base font-semibold text-lightAccent">Add team members</h2>
          <p className="mt-1 text-sm text-darkAccent">
            Add collaborators to your project. Teamwork makes the dream work!
          </p>
        </div>
        <form className="mt-6 flex">
          <Input
            type="text"
            placeholder="Search by username or email"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            className="w-full text-lightAccent shadow-sm ring-1 ring-inset border-darkAccent/65 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm/6"
          />
          <Button
            onClick={handleSearch}
            type='button'
            className="ml-4 text-xs text-lightAccent tracking-wider px-2 transition duration-300 ease-in"
          >
            Search
          </Button>
        </form>
        {error && <p className="text-center mt-4">{error}</p>}
      </div>
      <div className="mt-6">
        <ul role="list" className="mt-4 divide-y divide-primAccent border-b border-t border-primAccent">
              {searchResults.map((result) => (
                <li key={result.id} className='flex items-center justify-between space-x-3 py-4'>
                  <div className="flex min-w-0 flex-1 items-center space-x-3">
                    <div className="shrink-0">
                      {result.avatar_url ? (
                        <img src={result.avatar_url} className="h-10 w-10 rounded-full"/>
                      ) : (
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-300 text-lg text-primAccent">
                          {result.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-lightAccent">{result.username}</p>
                    </div>
                    <div className="shrink-0">
                      <button className="inline-flex items-center gap-x-1.5 text-sm/6 font-semibold text-lightAccent" onClick={() => handleAddContributor(result.id)}><IconPlus stroke={2} className="h-5 w-5 text-lightAccent"/> Invite</button>
                    </div>
                  </div>
                </li>
              ))}
        </ul>
      </div>
    </div>
  )
};
