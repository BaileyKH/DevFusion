import { useEffect, useState, useContext } from 'react';
import { UserContext } from '../App';
import { supabase } from '../supabaseDB';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ChangeLog = () => {
  const user = useContext(UserContext);
  const { projectId } = useParams<{ projectId: string }>();
  const [commits, setCommits] = useState([]);
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const githubToken = localStorage.getItem('github_token');

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
        <ul>
          {commits.map((commit: any, index: number) => (
            <li key={index} className="mb-4">
              <p>
                <strong>{commit.commit.author.name}</strong> committed on{' '}
                {new Date(commit.commit.author.date).toLocaleDateString()}:
              </p>
              <p>{commit.commit.message}</p>
              <a
                href={commit.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Commit
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChangeLog;
