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

### useQuery

- useQuery hook の第一引数には unique key を
- 第二引数には promise を書く

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
    {data.data.map((hero) => {
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
