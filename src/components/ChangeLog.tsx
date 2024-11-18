import { useEffect, useState, useContext } from 'react';
import { UserContext } from '../App';
import { supabase } from '../supabaseDB';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import ShineBorder from "@/components/ui/shine-border";

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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Change Log</h1>
      {commits.length === 0 ? (
        <p>No commits found for this repository.</p>
      ) : (
        <div className='bg-primDark rounded-lg'>
          <ShineBorder borderWidth={1} color={'#0398fc'} className='w-full p-4'>
          <Table>
          <TableCaption>A list of the most recent change logs.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] font-bold tracking-wider">User</TableHead>
              <TableHead className='font-bold tracking-wider'>Date</TableHead>
              <TableHead className='font-bold tracking-wider'>Commit</TableHead>
              <TableHead className="text-right font-bold tracking-wider">View Commit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commits.map((commit: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className='text-lightAccent'>{commit.commit.author.name}</TableCell>
                  <TableCell className='text-lightAccent'>{new Date(commit.commit.author.date).toLocaleDateString()}</TableCell>
                  <TableCell className='text-lightAccent'>{commit.commit.message}</TableCell>
                  <TableCell className="text-right">        <a
                  href={commit.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lightAccent hover:text-primAccent underline underline-offset-4"
                >
                  View Commit
                </a></TableCell>
                </TableRow>
            ))}
          </TableBody>
          </Table>
          </ShineBorder>
        </div>
      )}
    </div>
  );
};

export default ChangeLog;



