import {useState} from "react";
import {PostDetail} from "./PostDetail";
import {useQuery, useQueryClient} from "react-query";
import {useEffect} from "react";

const maxPostPage = 10;

async function fetchPosts(pageNum) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts?_limit=${maxPostPage}&_page=${pageNum}`
  );
  return response.json();
}

export function Posts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);

  const queryClient = useQueryClient();

  /*
  queryClient는 useQueryClient hooks을 통해서 가져올 수 있음

  단, 조심해야할 부분이 있음
    - 다음 페이지로 onClick 시 실행하는 건 좋은 생각이 아님.
    - setState가 상태를 업데이트하는데, "비동기"식으로 일어나기 때문
    - 이미 업데이트가 진행됐는지, 알 방법이 없음. 즉, 현재 페이지가 무엇인지 알 수 있는 확실한 방법이 없음.
    - 대신 useEffect를 사용하여 현재 페이지에 생기는 변경사항을 적용할 수 있음.
  */

  useEffect(() => {
    if (currentPage < maxPostPage) {
      const nextPage = currentPage + 1;

      queryClient.prefetchQuery(["posts", nextPage], () =>
        fetchPosts(nextPage)
      );
    }
  }, [currentPage, queryClient]);

  /*
  페이지 네이션에서 혹여나 이전페이지 버튼을 클릭했을 땐, 캐시를 이용해서 데이터를 가져오고 싶다면,
  keepPreviousData : true로 걸어주기 

  */

  // replace with useQuery
  const {data, isLoading, isError, error} = useQuery(
    ["posts", currentPage],
    () => fetchPosts(currentPage),
    {
      staleTime: 2000,
      keepPreviousData: true,
    }
  );

  if (isLoading) return <div>...Loading</div>;
  if (isError)
    return (
      <>
        <h3>Oops, something went wrong </h3>
        <p>{error.toString()}</p>
      </>
    );

  return (
    <>
      <ul>
        {data.map((post) => (
          <li
            key={post.id}
            className="post-title"
            onClick={() => setSelectedPost(post)}
          >
            {post.title}
          </li>
        ))}
      </ul>
      <div className="pages">
        <button
          disabled={currentPage <= 1}
          onClick={() => {
            setCurrentPage((previousValue) => previousValue - 1);
          }}
        >
          Previous page
        </button>
        <span>Page {currentPage}</span>
        <button
          disabled={currentPage >= maxPostPage}
          onClick={() => {
            setCurrentPage((previousValue) => previousValue + 1);
          }}
        >
          Next page
        </button>
      </div>
      <hr />
      {selectedPost && <PostDetail post={selectedPost} />}
    </>
  );
}

/*

isFetching : 아직 fetching이 완료되지 않았음, async 쿼리 함수가 해결되지 않았을 때 참에 해당. 아직 데이터를 가져오는 중.
isLoading : 가져오는 상태에 있음을 의미, isFetching이 참이면서, 쿼리에 대해 캐시된 데이터가 없는 상태.
            - 즉, isLoading 상태이거나, isLoading이 참인 경우, isFetching 또한 항상 참이다.
            - isLoading은 캐시된 데이터가 없고, 데이터를 가져오는 상황에 해당하는 "isFetching의 부분집합입니다. "
            - isFetching은 cache의 여부에 상관없이 데이터를 가져온다면 항상 동작함.
            - isFetching은 프리페이(Prefetch) 전에 행동함.


            위 코드에서 isFetching이 계속 동작하는데 그 이유는 다음과 같음.
            1. 프리페칭의 목적은 캐시된 데이터를 표시하면서 뒤에서 데이터의 업데이트 여부를 조용히 서버에서 확인하는 것.
            2. 그리고 데이터가 업데이트 된 경우 해당 데이터를 페이지에 보여줌.
            3. 프리페치의 작동방식은 currentPage가 업데이트 될 때, 예를 들어 useQuery에서의 쿼리 키가 새로운 페이지인 4페이지 라고 했을 때,
              캐시에 4페이지 데이터가 있는지 물음
            4. 4페이지 데이터를 프리페치 했기 때문에 존재하지만, 자동으로 만료(stale) 상태가 적용됨, staleTime의 기본값은 0, 따라서, fetchPosts를 실행할 것(isFetching True)
            5. 만약 다른 데이터를 반환한다면 데이터가 업데이트 될 것
            6. 따라서, 페이지에서 새로운 데이터가 표시 됨, 그러나 그전에는 캐시 된 데이터가 표시되고 있을 것, 그리고 다시 가져온 데이터가 캐시된 데이터와 동일하다고 해도 사용자는 전혀 모름, 데이터를 최신 상태로 유지하기 위해 서버와 확인했다는 것도 모름. 
            
*/

/*

9.

staleTime : re-fetching 할 때 고려대상
cacheTime : 나중에 다시 필요할 수도 있는 데이터용
            - 특정 쿼리에 대한 active된 useQuery가 없는 경우, 해당 데이터는 Cold Storage로 이동
            - 구성된 cacheTime이 지나면 캐시의 데이터가 만료되며 default는 5분
              - cacheTime이 관찰하는 시간은 특정 쿼리에 대한 useQuery가 active 된 후 경과시간임
            - 페이지에 표시되는 컴포넌트가 특정 쿼리에 대해 useQuery를 사용한 시간을 말함. 
            - 캐시가 만료되면 가비지 컬렉션이 실행되고 클라이언트에서 데이터를 사용할 수 없음.
          : 데이터가 캐시에 있는 동안에는 fetching할 때 사용할 수 있음
            - 데이터페칭을 중지하지 않으므로 서버의 최신 데이터로 새로 고침 가능.
            - 그러나, 계속해서 빈 페이지만 보는 경우가 생길 수 있음. → 무슨 데이터인지 알 수 없음.
            - 새로운 데이터를 수집하는 동안, 약간 오래된 데ㅣ터를 표시하는 편이 빈 페이지보다 낫다.
            - 여기에 동의하지 않는다거나, 만료된 데이터가 위험할 수 있는 애플리케이션의 경우 cacheTime을 0으로 설정하기
*/

/*

Prefetch

    - 데이터를 캐시에 추가하며 구성할 수 있긴 하지만 기본값으로 만료(stale) 상태
    - 즉, 데이터를 사용하고자 할 때 만료 상태에서 데이터를 다시 가져오는 것
    - 데이터를 다시 가져오는 중에는 캐시에 있는 데이터를 이용해 앱에 나타남 
      - 물론 캐시가 만료되지 않았다는 가정하에!, 사용자가 특정 페이지에서 cacheTime보다 오래 머물 수 있음.
      - 그때 다음 페이지 버튼을 클릭했다면, Loading 표시가 나타남, cache 되어 있는 데이터가 없기 때문.
    - 이렇게 추후 사용자가 사용할 법한 모든 데이터에 프리페칭을 사용함.
      - 페이지네이션 뿐만 아니라, 다수의 사용자가 웹 사이트 방문 시, 통계적으로 특정 탭을 누를 확률이 높다면, 해당 데이터를 미리 가져오는 게 좋음.

*/

/*



*/
