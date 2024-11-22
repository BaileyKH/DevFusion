import { useEffect, useState, useContext } from 'react';
import { UserContext } from '../App';
import { supabase } from '../supabaseDB';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import ShineBorder from "@/components/ui/shine-border";

import { motion } from "framer-motion";
import { IconGitCommit } from "@tabler/icons-react";

const ChangeLog = () => {
  const { user } = useContext(UserContext);
  const { projectId } = useParams<{ projectId: string }>();
  const [commits, setCommits] = useState([]);
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const githubToken = user.github_token;

  // Fetch project information to get GitHub repo URL
  const fetchProject = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('github_repo_url')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
    } else {
      setGithubRepoUrl(data.github_repo_url);
    }
  };

  // Fetch commits for the GitHub repository
  const fetchCommits = async () => {
    if (!githubRepoUrl || !githubToken) return;

    try {
      const response = await axios.get('http://localhost:3001/api/github/commits', {
        params: {
          repoUrl: githubRepoUrl,
          githubToken: githubToken,
        },
      });
      setCommits(response.data);
    } catch (error) {
      console.error('Error fetching commits:', error);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    if (githubRepoUrl) {
      fetchCommits();
    }
  }, [githubRepoUrl]);

  return (
    <div className="p-8 w-full min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          className="text-4xl font-bold text-lightAccent mb-8 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Change Log
        </motion.h1>
        {commits.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <IconGitCommit className="h-20 w-20 text-primAccent mb-4" />
            <h2 className="text-2xl font-semibold text-lightAccent">
              No commits found for this repository
            </h2>
            <p className="text-lightAccent/70 mt-2">
              Make your first commit to get started!
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="bg-primDark/80 rounded-lg shadow-lg overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <ShineBorder borderWidth={2} color={'#0398fc'} className="w-full">
              <div className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-darkAccent/40">
                      <TableHead className="w-[150px] font-bold tracking-wider text-primAccent">User</TableHead>
                      <TableHead className="font-bold tracking-wider text-primAccent">Date</TableHead>
                      <TableHead className="font-bold tracking-wider text-primAccent px-10">Commit Message</TableHead>
                      <TableHead className="text-right font-bold tracking-wider text-primAccent">View Commit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commits.map((commit: any, index: number) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="hover:bg-darkAccent/30 transition duration-200"
                      >
                        <TableCell className="text-lightAccent/85 py-4">{commit.commit.author.name}</TableCell>
                        <TableCell className="text-lightAccent/85 py-4">{new Date(commit.commit.author.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-lightAccent/85 px-10 py-4">{commit.commit.message}</TableCell>
                        <TableCell className="text-right py-4">
                          <a
                            href={commit.html_url}
                            target="_blank"
                            className="text-lightAccent/85 hover:text-primAccent transition duration-300 underline underline-offset-4"
                          >
                            View Commit
                          </a>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ShineBorder>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChangeLog;



