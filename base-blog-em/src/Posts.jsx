import {useState} from "react";
import {PostDetail} from "./PostDetail";
import {useQuery} from "react-query";

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

  // replace with useQuery
  const {data, isLoading, isError, error} = useQuery(
    ["posts", currentPage],
    () => fetchPosts(currentPage),
    {
      staleTime: 2000,
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
isFetching : 아직 fetching이 완료되지 않았음
isLoading : 가져오는 상태에 있음을 의미


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
