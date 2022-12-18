import axios from 'axios';
import { useQueries } from 'react-query';

const fetchSuperHero = (heroId) => {
  return axios.get(`http://localhost:4000/superheroes/${heroId}`);
};

export const DynamicParallelPage = ({ heroIds }) => {
  const queryResults = useQueries(
    heroIds.map((id) => {
      return {
        queryKey: ['super-hero', id],
        queryFn: () => fetchSuperHero(id),
      };
    })
  );

  return (
    <>
      <div>Dynamic Parallel Queries</div>
      <div>
        {queryResults.map((result) => (
          <p>{result.data?.data.name}</p>
        ))}
      </div>
    </>
  );
};
