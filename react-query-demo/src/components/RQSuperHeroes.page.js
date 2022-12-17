import axios from 'axios';
import { useQuery } from 'react-query';

const fetchSuperHeroes = () => {
  return axios.get('http://localhost:4000/superheroes');
};

export const RQSuperHeroesPage = () => {
  const onSuccess = (data) => {
    console.log({ data }); // Axios Response
  };

  const onError = (error) => {
    console.log({ error }); // Axios Error
  };

  const { isLoading, data, isError, error } = useQuery(
    'super-heroes',
    fetchSuperHeroes,
    {
      onSuccess,
      onError,
    }
  );

  if (isLoading) {
    return <h2>Loading...</h2>;
  }

  if (isError) {
    return <h2>{error.message}</h2>;
  }

  return (
    <>
      <h2>React Query Super Heroes Page</h2>
      {data?.data.map((hero) => {
        return <div key={hero.id}>{hero.name}</div>;
      })}
    </>
  );
};
