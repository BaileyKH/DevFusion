import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  project: any;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div
      className="border p-4 rounded shadow hover:shadow-lg cursor-pointer"
      onClick={handleClick}
    >
      <h2 className="text-xl font-semibold">{project.name}</h2>
      <p>{project.description}</p>
    </div>
  );
};