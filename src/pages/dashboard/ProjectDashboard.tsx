import { Outlet, NavLink, useParams } from 'react-router-dom';

export const ProjectDashboard = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div>
      <h1>Project Dashboard</h1>
      <nav>
        <NavLink to={`/projects/${projectId}`} end>
          Chat
        </NavLink>
        <NavLink to={`/projects/${projectId}/tasks`}>Tasks</NavLink>
        <NavLink to={`/projects/${projectId}/changelog`}>Change Log</NavLink>
        <NavLink to={`/projects/${projectId}/add`}>Add Members</NavLink>
      </nav>
      <div>
        <Outlet />
      </div>
    </div>
  );
};