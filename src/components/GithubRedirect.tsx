import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const GithubRedirect = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      localStorage.setItem('github_token', token);
      console.log('GitHub Access Token:', token);
    } else {
      console.error('No token found in URL parameters.');
    }
  }, [token]);

  return (
    <div>
      <h1>GitHub Authorization Successful</h1>
      <p>You have successfully connected to GitHub!</p>
    </div>
  );
};
