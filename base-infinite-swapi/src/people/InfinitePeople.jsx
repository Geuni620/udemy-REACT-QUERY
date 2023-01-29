import InfiniteScroll from "react-infinite-scroller";
import {useInfiniteQuery} from "react-query";
import {Person} from "./Person";

const initialUrl = "https://swapi.dev/api/people/";
const fetchUrl = async (url) => {
  const response = await fetch(url);
  return response.json();
};

export function InfinitePeople() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
    isFetching,
  } = useInfiniteQuery(
    "sw-people",
    ({pageParam = initialUrl}) => fetchUrl(pageParam),
    {
      getNextPageParam: (lastPage) => {
        return lastPage.next || undefined;
      },
    }
  );

  if (isLoading) return <div className="loading">...Loading</div>;
  if (isError) return <div>Error {error.toString()}</div>;

  // TODO: get data for InfiniteScroll via React Query
  return (
    <>
      {isFetching && <div className="loading">...fetching</div>}
      <InfiniteScroll loadMore={fetchNextPage} hasMore={hasNextPage}>
        {data.pages.map((pageData) =>
          pageData.results.map((person) => (
            <Person
              key={person.name}
              name={person.name}
              hairColor={person.hairColor}
              eyeColor={person.eyeColor}
            />
          ))
        )}
      </InfiniteScroll>
    </>
  );
}

/*
  react-infinite-scroller
    - loadMore : 데이터가 더 필요할 때 불러와 useInfiniteQuery에서 나온 fetchNextPage 함숫값을 이용함
    - hasMore : useInfiniteQuery에서 나온 객체를 구조분해할당 한 값을 이용함
*/

/*
  무한 스크롤 구현 시, isLoading → isFetching으로 변경
    - 스크롤을 내려서 새로운 페이지가 열리면 스크롤이 위로 올라가 버림
    - 이건 새로운 페이지가 열릴 때마다 조기 반환이 돼서 그럼
    - 데이터가 더 있지만 스크롤이 원위치되는 이유는, 새로운 페이지를 열어야 할 때 조기 반환이 실행되기 때문
    - 
*/
