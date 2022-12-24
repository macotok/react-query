# react-query

## React Query

What？

- React アプリケーションの data fetching ライブラリ

Why?

- React では data fetch を定義してない
- useEffect hook で data fetch を行い、useState に data、isLoading、error を格納
- data をアプリ全体で使うには、状態管理ライブラリを利用する必要がある
- 状態管理ライブラリは静的なデータを扱うには適している
- 一方で、非同期処理を扱うには適していない、そのため middleware ライブラリが別途必要

Feature

- cache が効くので既に fetch した data は、cache された data から取り出す。もし data が更新されたら background で refetch して新しい data を表示する。 `isFetching` で確認できる

## Client vs Server State

Client State

- 同期処理を受けて data を取得、更新

Server State

- 非同期処理で data を取得、更新

## 目次

1.  Basic queries
2.  Poll data
3.  RQ dev tools
4.  Create reusable query hooks
5.  Query by ID
6.  Parallel queries
7.  Dynamic queries
8.  Dependent queries
9.  Infinite & paginated queries
10. Update data using mutations
11. Invalidate queries
12. Optimistic updates
13. Axios Interceptor

## 従来の fetching data

```
const [isLoading, setIsLoading] = useState(true);
const [data, setData] = useState([]);
const [error, setError] = useState('')

useEffect(() => {
  axios
    .get('http://localhost:4000/superheroes')
    .then((res) => {
      setData(res.data);
      setIsLoading(false);
    })
    .catch((error) => {
      setError(error.message);
      setIsLoading(false);
    });
}, []);

if (isLoading) {
  return <h2>Loading...</h2>;
}

if (error) {
    return <h2>{error}</h2>;
  }

return (
  <>
    {data.map((hero) => {
      return <div key={hero.id}>{hero.name}</div>;
    })}
  </>
);
```

## how to use react-query

### setup

- root component(app.js) で QueryClientProvider を wrap する

```
import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    .
    .
    .
    </QueryClientProvider>
  )
}
```

### ReactQueryDevtools

- react-query 専門の開発ツール
- react-query の内部構造を可視化するので、デバッグにも有用
- React Native はサポートしていない
- デフォルトで `process.env.NODE_ENV === 'development'` のときのみバンドルするように設定されている

```
import { ReactQueryDevtools } from 'react-query/devtools';

return (
  <QueryClientProvider client={queryClient}>
    .
    .
    .
    <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
  </QueryClientProvider>
)
```

## useQuery

- useQuery hook の第一引数に query key
- 第二引数に fetcher 関数
- 第三引数に option、configure
- `useQuery`、`useQueries`、`useInfiniteQuery`は API GET で利用

```
useQuery('super-heroes', () => {
  return axios.get('http://localhost:4000/superheroes')
})
```

- useQuery hook で返ってくる値([公式](https://react-query-v3.tanstack.com/reference/useQuery#_top))

```
const {
  data,
  dataUpdatedAt,
  error,
  errorUpdatedAt,
  failureCount,
  isError,
  isFetched,
  isFetchedAfterMount,
  isFetching,
  isIdle,
  isLoading,
  isLoadingError,
  isPlaceholderData,
  isPreviousData,
  isRefetchError,
  isRefetching,
  isStale,
  isSuccess,
  refetch,
  remove,
  status,
} = useQuery
```

### use-query で fetching data

```
const { isLoading, data, isError, error } = useQuery('super-heroes', () => {
  return axios.get('http://localhost:4000/superheroes');
});

if (isLoading) {
  return <h2>Loading...</h2>;
}

if (isError) {
  return <h2>{error.message}</h2>;
}

return (
  <>
    {data?.data.map((hero) => {
      return <div key={hero.id}>{hero.name}</div>;
    })}
  </>
);
```

### cache time

- data をキャッシュとして保持する時間
- default の cache time は `5 minutes`

```
const fetchSuperHeroes = () => {
  return axios.get('http://localhost:4000/superheroes');
};

const { isLoading, data, isError, error } = useQuery(
  'super-heroes',
  fetchSuperHeroes,
  {
    cacheTime: 5000, // default 5 minutes
  }
);
```

### stale time

- refetch する時間を指定。時間内では fetch せずにキャッシュのデータを返す
- default の stale time は `0`

```
const { isLoading, data, isError, error } = useQuery(
  'super-heroes',
  fetchSuperHeroes,
  {
    staleTime: 30000, // default 0
  }
);
```

### refetch するタイミングを制御

- refetchOnWindowFocus -> default `true`
- refetchOnMount -> default `true`

```
const { isLoading, data, isError, error } = useQuery(
  'super-heroes',
  fetchSuperHeroes,
  {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  }
);
```

### refetch interval

- refetchInterval
- refetchIntervalInBackground -> refetchInterval を設定した場合、ブラウザのタブ/ウィンドウがバックグラウンドにある間、refetch を行う

```
const { isLoading, data, isError, error } = useQuery(
  'super-heroes',
  fetchSuperHeroes,
  {
    refetchInterval: 2000,
    refetchIntervalInBackground: true
  }
);
```

### useQuery on click

- click 時のみ data fetch する処理
- option で `enabled`　を `false` に指定すると通常は fetch しない処理
- click イベントに `refetch` を指定すると click 時に data fetch が行われる
- loading 表示は `isFetching` で制御する

```
const fetchSuperHeroes = () => {
  return axios.get('http://localhost:4000/superheroes');
};

export const RQSuperHeroesPage = () => {
  const { isLoading, data, isError, error, refetch, isFetching } = useQuery(
    'super-heroes',
    fetchSuperHeroes,
    {
      enabled: false,
    }
  );

  if (isLoading || isFetching) {
    return <h2>Loading...</h2>;
  }

  if (isError) {
    return <h2>{error.message}</h2>;
  }

  return (
    <>
      <h2>React Query Super Heroes Page</h2>
      <button onClick={refetch}>fetch</button>
      {data?.data.map((hero) => {
        return <div key={hero.id}>{hero.name}</div>;
      })}
    </>
  );
};
```

### Dependent Queries

- 複数の fetcher function で、お互いが依存してる場合に option の`enabled` を利用して fetch を制御する

```
const { data: user } = useQuery(['user', email], () =>
  fetchUserByEmail(email)
);

const channelId = user?.data?.channelId;

const { data } = useQuery(
  ['courses', channelId],
  () => fetchCoursesByChannelId(channelId),
  {
    enabled: !!channelId,
  }
);
```

### Success and Error Callbacks

- option に `onSuccess`、`onError` で data fething を受けてのハンドリング処理を行う。例えば toast を表示、ダイアログを表示、一覧を更新など
- callback 関数の引数にはそれぞれ `data`、`error`が入る

```
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
};
```

### Data Transformation

- option の `select` メソッドの引数に fetch の response data が入る
- その data を処理して返した値が useQuery が返す `data` となる

```
const fetchSuperHeroes = () => {
 return axios.get('http://localhost:4000/superheroes');
};

export const RQSuperHeroesPage = () => {
 const { isLoading, data, isError, error } = useQuery(
   'super-heroes',
   fetchSuperHeroes,
   {
     select: (data) => {
       const superHeroNames = data.data.map((hero) => hero.name);
       return superHeroNames;
     },
   }
 );

 return (
   <>
     <h2>React Query Super Heroes Page</h2>
     {data.map((heroName) => {
       return <div key={heroName}>{heroName}</div>;
     })}
   </>
 );
};
```

### Query By Id

- 詳細画面の data を fetch するとき、useQuery の第一引数を配列にして queryKey とする。例：`['super-hero', heroId]`
- 第二引数の fetcher 関数で dynamic ID を指定
  - fetcher 関数の引数で useQuery の第一引数の queryKey から取得
  - 高階関数で fetcher 関数を定義

```
const fetchSuperHero = ({ queryKey }) => {
  const heroId = queryKey[1];
  return axios.get(`http://localhost:4000/superheroes/${heroId}`);
};

export const useSuperHeroData = (heroId) => {
  return useQuery(['super-hero', heroId], fetchSuperHero);
};
```

```
const fetchSuperHero = (heroId) => {
  return axios.get(`http://localhost:4000/superheroes/${heroId}`);
};

export const useSuperHeroData = (heroId) => {
  return useQuery(['super-hero', heroId], () => fetchSuperHero(heroId));
};
```

### Initial Query Data

- 詳細画面の data を一覧画面の data から初期値として取得する
- useQuery の option `initialData` で data を取得する処理を記述
- `useQueryClient` で取得対象の queryKey を指定して data を取得

```
const queryClient = useQueryClient();
useQuery(['super-hero', heroId], fetchSuperHero, {
  initialData: () => {
    const hero = queryClient
      .getQueryData('super-heroes')
      ?.data?.find((hero) => hero.id === parseInt(heroId));
    if (hero) {
      return { data: hero };
    }
    return undefined;
  },
});
```

### Paginated Queries

- useQuery の `queryKey` にページ番号を指定するだけ
- useQuery の option `keepPreviousData` を `true` で取得済みの data を表示

```
const [pageNumber, setPageNumber] = useState(1);
const { isLoading, isError, error, data, isFetching } = useQuery(
  ['colors', pageNumber],
  () => fetchColors(pageNumber),
  {
    keepPreviousData: true,
  }
);
```

## useQueries

- 複数の useQuery に対応
- 返り値の `queryKey`に queryKey、 `queryFn`に fetcher function、option は `useQuery` と同等
- response data を配列として返す

```
const fetchSuperHero = (heroId) => {
  return axios.get(`http://localhost:4000/superheroes/${heroId}`);
};

const queryResults = useQueries(
  heroIds.map((id) => {
    return {
      queryKey: ['super-hero', id],
      queryFn: () => fetchSuperHero(id),
    };
  })
);
```

### useInfiniteQuery

- `useQuery` ではなく `useInfiniteQuery` を使用
- `useInfiniteQuery` の option `getNextPageParam` で infinite 対象 data を制御
  - fetcher 関数の引数にページ番号の `pageParams`が入る
  - `useInfiniteQuery`の値`hasNextPage` で button の disabled 判定を行う
  - `useInfiniteQuery`の値`fetchNextPage` で fetch 処理を行う
- 取得した data は `data?.pages.map((group)` と `pages` で map を回すので注意

```
const fetchColors = ({ pageParam = 1 }) => {
  return axios.get(`http://localhost:4000/colors?_limit=2&_page=${pageParam}`);
};

const {
  data,
  fetchNextPage,
  hasNextPage,
} = useInfiniteQuery(['colors'], fetchColors, {
  getNextPageParam: (lastPage, pages) => {
    if (pages.length < 4) {
      return pages.length + 1;
    } else {
      return undefined;
    }
  },
});

{data?.pages.map((group, i) => {
  return (
    <Fragment key={i}>
      {group.data.map((color) => (
        <h2 key={color.id}>
          {color.id} {color.label}
        </h2>
      ))}
    </Fragment>
  );
})}

<button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
  Load more
</button>
```

## useMutation

- API POST、UPDATE、DELETE で利用
- `useMutation`の第一引数に fetcher 関数を指定
- `useMutation`を返す関数の値で、`mutate`の引数に payload を 渡す

```
const {
  data,
  error,
  isError,
  isIdle,
  isLoading,
  isPaused,
  isSuccess,
  mutate,
  mutateAsync,
  reset,
  status,
} = useMutation(mutationFn, {
  mutationKey,
  onError,
  onMutate,
  onSettled,
  onSuccess,
  retry,
  retryDelay,
  useErrorBoundary,
  meta,
})

mutate(variables, {
  onError,
  onSettled,
  onSuccess,
})
```

```
import { useMutation } from 'react-query';
import axios from 'axios';

const addSuperHero = (hero) => {
  return axios.post('http://localhost:4000/superheroes', hero);
};

const useAddSuperHeroData = () => {
  return useMutation(addSuperHero);
};

const { mutate } = useAddSuperHeroData();

const handleAddHeroClick = () => {
  mutate({ name, alterEgo });
};
```
