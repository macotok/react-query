# react-query

## React Query

What？

- React アプリケーションの data fetching ライブラリ
- React および React Native アプリケーションのデータを、global state に触れることなくフェッチ、キャッシュ、アップデートできる

Why?

- React 単体では `useEffect`内で data fetch を行い、`useState` で response data、isLoading、error を管理する
- ただし、近い将来 Raect の新しい API `use` で data fetch を扱うことできる？
- もし data をアプリケーション全体で扱うには、Redux や Recoil などの状態管理ライブラリを利用する
- Redux で非同期処理を扱うには redux-saga、redux-thunk などの middleware ライブラリが別途必要

Feature

- cache が効くので、既に fetch した data は cache data から取り出す
- もし data が更新されたら background で refetch して、新しい data を表示

## 従来の data fetching

```
const [isLoading, setIsLoading] = useState(true);
const [data, setData] = useState([]);
const [error, setError] = useState('')

useEffect(() => {
  axios
    .get('http://localhost:4000/users')
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
    {data.map((user) => {
      return <div key={user.id}>{user.name}</div>;
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
- React Native はサポートされていない
- デフォルトで `process.env.NODE_ENV === 'development'` のみ bundle するよう設定されている

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

- `useQuery` で第一引数には query key を。第二引数に fetcher 関数。第三引数に option、configure を指定
- query key は一意とする
- `useQuery`、`useQueries`、`useInfiniteQuery`は API GET Request 時に使用する
- 公式 doc「[useQuery](https://react-query-v3.tanstack.com/reference/useQuery)」

```
useQuery('users', () => {
  return axios.get('http://localhost:4000/users')
})
```

`useQuery` を実行して返ってくる値

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

### use-query で data fetching

```
const { isLoading, data, isError, error } = useQuery('users', () => {
  return axios.get('http://localhost:4000/users');
});

if (isLoading) {
  return <h2>Loading...</h2>;
}

if (isError) {
  return <h2>{error.message}</h2>;
}

return (
  <>
    {data?.data.map((user) => {
      return <div key={user.id}>{user.name}</div>;
    })}
  </>
);
```

### cache time

- data をキャッシュとして保持する時間
- default の cache time は `5 minutes`

```
const fetchUsers = () => {
  return axios.get('http://localhost:4000/users');
};

const { isLoading, data, isError, error } = useQuery(
  'users',
  fetchUsers,
  {
    cacheTime: 5000,
  }
);
```

### stale time

- refetch する時間を指定。指定した時間内では fetch せずにキャッシュのデータを返す
- default の stale time は `0`。マウントされるとすぐに再取得される。

```
const fetchUsers = () => {
  return axios.get('http://localhost:4000/users');
};

const { isLoading, data, isError, error } = useQuery(
  'users',
  fetchUsers,
  {
    staleTime: 30000,
  }
);
```

### refetch するタイミングを制御

- refetchOnWindowFocus -> default `true`
- refetchOnMount -> default `true`

```
const fetchUsers = () => {
  return axios.get('http://localhost:4000/users');
};

const { isLoading, data, isError, error } = useQuery(
  'users',
  fetchUsers,
  {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  }
);
```

### refetch interval

- refetchIntervalInBackground を `true`にして、 refetchInterval を設定した場合、ブラウザのタブ/ウィンドウがバックグラウンドにある間、refetchInterval で指定した時間ごとに refetch を行う

```
const { isLoading, data, isError, error } = useQuery(
  'users',
  fetchUsers,
  {
    refetchInterval: 2000,
    refetchIntervalInBackground: true
  }
);
```

### useQuery on click

- click 時のみ data fetch する処理
- option で `enabled`　を `false` に指定すると、通常は fetch しない
- click イベントに `refetch` を指定すると、 click 時に data fetch する
- loading 表示は `isFetching` で制御する

```
const fetchUsers = () => {
  return axios.get('http://localhost:4000/users');
};

const { isLoading, data, isError, error, refetch, isFetching } = useQuery(
  'users',
  fetchUsers,
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
    <button onClick={refetch}>fetch</button>
    {data?.data.map((user) => {
      return <div key={user.id}>{user.name}</div>;
    })}
  </>
);
```

### Dependent Queries

- 複数の fetcher 関数で、お互いが依存してる場合に option の`enabled` を利用して fetch を制御する

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

### other uses of enabled

- 特定の値を取得したときに fetch する

```
const { id } = useParams();

const { isLoading, isError, data } = useQuery(
  ['user', id],
  () => {
    return axios.get(`http://localhost:4000/users/${id}`);
  },
  {
    enabled: !!id,
  }
);
```

### Success and Error Callbacks

- option に `onSuccess`、`onError` で data fetch した結果のハンドリングを行う。例えば toast を表示、ダイアログを表示、一覧を更新など
- callback 関数の引数にはそれぞれ `data`、`error`が入る

```
const fetchUsers = () => {
  return axios.get('http://localhost:4000/users');
};

const onSuccess = (data) => {
  console.log({ data }); // Axios Response
};

const onError = (error) => {
  console.log({ error }); // Axios Error
};

const { isLoading, data, isError, error } = useQuery(
  'users',
  fetchUsers,
  {
    onSuccess,
    onError,
  }
);
```

### Data Transformation

- option `select` の引数に data fetch の response data が入る
- その data を扱って、返す値が `useQuery` の `data` となる

```
const fetchUsers = () => {
 return axios.get('http://localhost:4000/users');
};

const { isLoading, data, isError, error } = useQuery(
  'users',
  fetchUsers,
  {
    select: (data) => {
      const userNames = data.data.map((user) => user.name);
      return userNames;
    },
  }
);

return (
  <>
    {data.map((userName) => {
      return <div key={userName}>{userName}</div>;
    })}
  </>
);
```

### Query By Id

- 詳細画面の data を fetch するとき、`useQuery` の query key を配列で扱う。例：`['user', userId]`
- 第二引数の fetcher 関数の扱いが 2 通りある
  1. fetcher 関数の引数で queryKey を取得
  2. 第二引数に関数を作成して そこで fetcher 関数を書く

パターン 1

```
const fetchUser = ({ queryKey }) => {
  const userId = queryKey[1];
  return axios.get(`http://localhost:4000/users/${userId}`);
};

const userData = (userId) => {
  return useQuery(['user', userId], fetchUser);
};
```

パターン 2

```
const fetchUser = (userId) => {
  return axios.get(`http://localhost:4000/users/${userId}`);
};

const userData = (userId) => {
  return useQuery(['user', userId], () => fetchUser(userId));
};
```

### Initial Query Data

- 詳細画面の data を一覧画面の data を元に初期値として設定する
- `useQuery` の option `initialData` で data を取得する処理を記述
- `useQueryClient` で取得対象の `queryKey` を指定して data を取得

```
const fetchUser = ({ queryKey }) => {
  const userId = queryKey[1];
  return axios.get(`http://localhost:4000/users/${userId}`);
};

const queryClient = useQueryClient();

useQuery(['user', userId], fetchUser, {
  initialData: () => {
    const user = queryClient
      .getQueryData('users')
      ?.data?.find((user) => user.id === parseInt(userId));
    if (user) {
      return { data: user };
    }
    return undefined;
  },
});
```

### Paginated Queries

- `useQuery` の `queryKey` にページ番号を指定するだけ
- `useQuery` の option `keepPreviousData` を `true` にすると、取得済みの data を表示

```
const [pageNumber, setPageNumber] = useState(1);

const { isLoading, isError, error, data, isFetching } = useQuery(
  ['users', pageNumber],
  () => fetchUsers(pageNumber),
  {
    keepPreviousData: true,
  }
);
```

## useQueries

- 複数の useQuery に対応
- 返り値の `queryKey`に queryKey を、`queryFn`に fetcher 関数を、option は `useQuery` と同等
- response data は配列となる

```
const fetchUser = (userId) => {
  return axios.get(`http://localhost:4000/users/${userId}`);
};

const queryResults = useQueries(
  userIds.map((userId) => {
    return {
      queryKey: ['user', userId],
      queryFn: () => fetchUser(userId),
    };
  })
);
```

### useInfiniteQuery

- `useQuery` の替わりとして `useInfiniteQuery` を使用
- `useInfiniteQuery` の option `getNextPageParam` で infinite 対象の data を制御
  - fetcher 関数の引数に、ページ番号の `pageParam`が入る
  - `useInfiniteQuery`で取得する値 `hasNextPage` で button の disabled 判定を行う
  - `useInfiniteQuery`で取得する値 `fetchNextPage` で fetch 処理を行う
- 取得した data は `data?.pages.map((group)` の `pages` で map を回すので注意

```
const fetchUsers = ({ pageParam = 1 }) => {
  return axios.get(`http://localhost:4000/users?_limit=2&_page=${pageParam}`);
};

const {
  data,
  fetchNextPage,
  hasNextPage,
} = useInfiniteQuery(['users'], fetchUsers, {
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
      {group.data.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </Fragment>
  );
})}

<button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
  Load more
</button>
```

## useMutation

- API の POST、UPDATE、DELETE Request で利用
- `useMutation`の第一引数に fetcher 関数を指定
- `useMutation`を返す関数の値で、`mutate`の引数に payload を 渡す

### useQuery の違い

- cache がない
- retry しない
- refetch しない
- mutate 関数を返す
- onMutate というコールバックがある(Optimistic Update のために使う)

### 使用例

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

const addUser = (user) => {
  return axios.post('http://localhost:4000/users', user);
};

const useAddUserData = () => {
  return useMutation(adduser);
};

const { mutate } = useAddUserData();

const handleClick = () => {
  mutate({ name, age });
};
```

### Query invalidation

- mutation で更新したデータを再取得する場合、取得済みのキャッシュを明示的に破棄する
- データ再フェッチのトリガーとする
- `useQueryClient` で対象の query key を指定する
- `useMutation`のオプション `onSettled` で `invalidateQueries`を使用して query key を指定すると、その query のキャッシュが古くなったとみなす

```
import { useMutation, useQueryClient } from 'react-query';

const addUser = (user) => {
  return axios.post('http://localhost:4000/users', user);
};

const useAddUserData = () => {
  const queryClient = useQueryClient();

  return useMutation(addUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
    },
  });
};

const { mutate } = useAddUserData();

const handleClick = () => {
  mutate({ name, age });
};
```

### setQueryData

- 第一引数には query key を指定。第二引数の関数の引数には既存の data が格納される
- `setQueryData` で同期的に data を扱う。一方で fetchQuery は非同期で data を扱う
- 複数の query を 1 度で更新するときに使用する
- Chrome の devtool の Network で API GET Request が呼ばれてないことを確認できる
- さらに data を整形することも可能

```
import { useMutation, useQueryClient } from 'react-query';

const addUser = (user) => {
  return axios.post('http://localhost:4000/users', user);
};

const useAddUserData = () => {
  const queryClient = useQueryClient();

  return useMutation(addUser, {
    onSuccess: (data) => {
      queryClient.setQueryData('users', (oldQueryData) => {
        return {
          ...oldQueryData,
          data: [...oldQueryData.data, data.data],
        };
      });
    },
    onError: () => {}
  });
};

const { mutate } = useAddUserData();

const handleClick = () => {
  mutate({ name, age });
};
```

### Optimistic Updates

Optimistic Update について

```
SPAでAPIを利用しデータを更新し、その結果を画面に反映させる場合、APIのレスポンスを待つ必要がある。
しかし、レスポンスを待ってから画面に反映すると、ユーザーが操作してから画面に反映されるまでに時間がかかり、UXが悪くなる。
Optimistic Updateでそれを解決する。
```

想定結果を反映する

```
Optimistic UpdateはAPIのレスポンスを待たずに想定する結果を画面に反映する。
これによってユーザーの操作後、すぐ画面に反映される。
またAPIのレスポンスが返ってきたら再度画面に反映されます。
その場合、2度画面の更新が発生するので、画面のチラツキが発生する可能性はありますが、想定したとおりのレスポンスが返ってきたら、画面上変化はなくユーザーにはわかりません。
```

[Optimistic Update (楽観的更新)でストレスのない UX を実現する](https://zenn.dev/funteractiveinc/articles/optimistic-update)

- React Query で `Optimistic Update` を取り込むには `onMutate` を使う
- `useQueryClient`関数のメソッド`cancelQueries`、`getQueryData`、`setQueryData`、`invalidateQueries`を用いて、data set とエラーのハンドリングを行う

onMutate について

```
onMutateはmutation関数が起動される前に起動する。
mutationが成功することを期待して、リソースに対して `Optimistic Update` を行うのに便利です。
仮にmutationが失敗した場合、 onError に。 onSettled にエラー時、またはdata setのdataが渡され、`Optimistic Update` をロールバックするのに便利。
```

```
const addUser = (user) => {
  return axios.post('http://localhost:4000/users', user);
};

const useAddUserData = () => {
  const queryClient = useQueryClient();

  return useMutation(addUser, {
    onMutate: async (newUser) => {
      await queryClient.cancelQueries('users');
      const previousUserData = queryClient.getQueryData('users');
      queryClient.setQueryData('users', (oldQueryData) => {
        return {
          ...oldQueryData,
          data: [
            ...oldQueryData.data,
            { id: oldQueryData?.data?.length + 1, ...newUser },
          ],
        };
      });
      return { previousUserData };
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData('users', context.previousUserData);
    },
    onSettled: () => {
      queryClient.invalidateQueries('users');
    },
  });
};
```

## 参考サイト

- [React Query Tutorial for Beginners](https://www.youtube.com/playlist?list=PLC3y8-rFHvwjTELCrPrcZlo6blLBUspd2)
- [【React】React Query の useMutation()でデータ更新を行う(Optimistic Update, invalidateQueries, AbortController)](https://qiita.com/suzuki0430/items/1812e600797bba661cef)
- [React Query: Beyond the Basics](https://javascript.plainenglish.io/react-query-beyond-basics-f43149c7a36a)
