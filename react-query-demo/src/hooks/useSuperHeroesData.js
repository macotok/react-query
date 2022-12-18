import axios from 'axios';
import { useQuery } from 'react-query';

const fetcher = () => {
  return axios.get('http://localhost:4000/superheroes');
};

export const useSuperHeroesData = (onSuccess, onError) => {
  return useQuery('super-heroes', fetcher, {
    onSuccess,
    onError,
  });
};
