import InfiniteScroll from "react-infinite-scroller";
import {Species} from "./Species";
import {useInfiniteQuery} from "react-query";

const initialUrl = "https://swapi.dev/api/species/";
const fetchUrl = async (url) => {
  const response = await fetch(url);
  return response.json();
};

export function InfiniteSpecies() {
  // TODO: get data for InfiniteScroll via React Query

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isError,
    error,
  } = useInfiniteQuery(
    "sw-species",
    ({pageParam = initialUrl}) => fetchUrl(pageParam),
    {
      getNextPageParam: (lastPage) => {
        return lastPage.next || undefined;
      },
    }
  );

  if (isLoading) return <div className="loading">...Loading</div>;
  if (isError) return <div>Error! {error.toString()}</div>;

  return (
    <>
      {isFetching && <div className="loading">...fetching</div>}
      <InfiniteScroll loadMore={fetchNextPage} hasMore={hasNextPage}>
        {data.pages.map((pageData) =>
          pageData.results.map((spec) => {
            return (
              <Species
                key={spec.name}
                name={spec.name}
                language={spec.language}
                averageLifespan={spec.averageLifespan}
              />
            );
          })
        )}
      </InfiniteScroll>
    </>
  );
}
