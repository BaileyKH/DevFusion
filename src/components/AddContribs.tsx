import { useState, useContext } from 'react';
import { UserContext } from '../App';
import { supabase } from '../supabaseDB';

import { IconPlus, IconSearch } from '@tabler/icons-react';
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

interface AddContributorProps {
    projectId: string;
}

export const AddContribs = ({ projectId }: AddContributorProps) => {
  const { user } = useContext(UserContext);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, avatar_url')
      .or(`username.ilike.%${usernameOrEmail}%,email.ilike.%${usernameOrEmail}%`);

    if (error) {
      toast({
        title: "Error",
        description: "Error searching users",
        variant: "destructive",
      });
      return;
    } else {
      setSearchResults(data || []);
    }
  };

  const handleInviteContributor = async (userId: string) => {
    const { data: existingInvite } = await supabase
      .from('project_invitations')
      .select('id')
      .eq('project_id', projectId)
      .eq('invitee_id', userId)
      .single();

    if (existingInvite) {
      toast({
        title: "Error",
        description: "User is already invited",
        variant: "destructive",
      });
      return;
    }

    const { data: existingMembership } = await supabase
      .from('project_memberships')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (existingMembership) {
      toast({
        title: "Error",
        description: "User is already a contributor",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from('project_invitations').insert({
      project_id: projectId,
      invitee_id: userId,
      inviter_id: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Error sending invitation",
        variant: "destructive",
      });
      return;
    } else {
      toast({
        title: "Success",
        description: "Invitation sent successfully!",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-12 px-4">
      <div className="text-center">
        <motion.svg
          fill="none"
          stroke="#0398fc"
          viewBox="0 0 48 48"
          aria-hidden="true"
          className="mx-auto h-14 w-14"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <path
            d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
        <motion.h2
          className="mt-4 text-3xl font-bold text-lightAccent"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
        >
          Add Team Members
        </motion.h2>
        <motion.p
          className="mt-1 text-md text-lightAccent/80"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          Add collaborators to your project. Teamwork makes the dream work!
        </motion.p>
      </div>

      <motion.form
        className="mt-8 flex items-center w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
      >
        <Input
          type="text"
          placeholder="Search by username or email"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          className="w-full px-4 py-3 text-lightAccent shadow-md border border-darkAccent/65 placeholder:text-gray-500 focus:ring-2 focus:ring-primAccent rounded-lg"
        />
        <Button
          onClick={handleSearch}
          type="button"
          className="ml-4 px-4 py-3 bg-gradient-to-r from-[#0398fc] to-[#00c6ff] text-lightAccent shadow-md rounded-lg flex items-center gap-2 hover:shadow-lg transition duration-300"
        >
          <IconSearch stroke={1.5} className="w-5 h-5" />
          Search
        </Button>
      </motion.form>

      <div className="w-full max-w-md mt-10">
        <ul role="list" className="divide-y divide-primAccent">
          {searchResults.map((result) => (
            <motion.li
              key={result.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center justify-between p-4 rounded-lg bg-[#1e1e1e] shadow-md hover:shadow-xl transition duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="shrink-0">
                  {result.avatar_url ? (
                    <img src={result.avatar_url} alt='users profile picture' className="h-12 w-12 rounded-full shadow-md" />
                  ) : (
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#0398fc] text-lg text-lightAccent">
                      {result.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-lightAccent font-medium">{result.username}</p>
                </div>
              </div>
              <Button
                onClick={() => handleInviteContributor(result.id)}
                className="px-4 py-2 bg-gradient-to-r from-[#0398fc] to-[#00c6ff] text-lightAccent rounded-lg flex items-center gap-1 hover:shadow-md transition duration-300"
              >
                <IconPlus stroke={1.5} className="w-5 h-5" />
                Invite
              </Button>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
};
