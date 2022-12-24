import { useMutation, useQuery } from 'react-query';

import axios from 'axios';

const fetcher = () => {
  return axios.get('http://localhost:4000/superheroes');
};

export const useSuperHeroesData = (onSuccess, onError) => {
  return useQuery('super-heroes', fetcher, {
    onSuccess,
    onError,
  });
};

const addSuperHero = (hero) => {
  return axios.post('http://localhost:4000/superheroes', hero);
};

export const useAddSuperHeroData = () => {
  return useMutation(addSuperHero);
};
