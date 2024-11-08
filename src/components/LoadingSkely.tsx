import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const LoadingSkely: React.FC = () => {
  return (
    <div className="p-4">
      <Skeleton height={30} width="50%" />
      <Skeleton height={20} count={4} />
    </div>
  );
};
