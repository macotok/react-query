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
      select: (data) => {
        const superHeroNames = data.data.map((hero) => hero.name);
        return superHeroNames;
      },
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
      {data.map((heroName) => {
        return <div key={heroName}>{heroName}</div>;
      })}
    </>
  );
};
