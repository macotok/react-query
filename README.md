# react-query

## React Query

What？

- React アプリケーションの data fetch ライブラリ

Why?

- React では data fetch を定義してない
- useEffect hook で data fetch を行い、useState に data、isLoading、error を格納
- data をアプリ全体で使うには、状態管理ライブラリを利用する必要がある
- 状態管理ライブラリは静的なデータを扱うには適している
- 一方で、非同期処理を扱うには適していない、そのため middleware ライブラリが別途必要

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
