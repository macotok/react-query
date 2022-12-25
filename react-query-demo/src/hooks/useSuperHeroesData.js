import { useMutation, useQuery, useQueryClient } from 'react-query';

import { request } from '../utils/axios-utils';

const fetcher = () => {
  return request({ url: '/superheroes' });
};

export const useSuperHeroesData = (onSuccess, onError) => {
  return useQuery('super-heroes', fetcher, {
    onSuccess,
    onError,
  });
};

const addSuperHero = (hero) => {
  return request({ url: '/superheroes', method: 'post', data: hero });
};

export const useAddSuperHeroData = () => {
  const queryClient = useQueryClient();

  return useMutation(addSuperHero, {
    onMutate: async (newHero) => {
      await queryClient.cancelQueries('super-heroes');
      const previousHeroData = queryClient.getQueryData('super-heroes');
      queryClient.setQueryData('super-heroes', (oldQueryData) => {
        return {
          ...oldQueryData,
          data: [
            ...oldQueryData.data,
            { id: oldQueryData?.data?.length + 1, ...newHero },
          ],
        };
      });
      return { previousHeroData };
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData('super-heroes', context.previousHeroData);
    },
    onSettled: () => {
      queryClient.invalidateQueries('super-heroes');
    },
  });
};
