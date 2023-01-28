import {useState} from "react";
import {PostDetail} from "./PostDetail";
import {useQuery} from "react-query";

const maxPostPage = 10;

async function fetchPosts() {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/posts?_limit=10&_page=0"
  );
  return response.json();
}

export function Posts() {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);

  // replace with useQuery
  const {data, isLoading, isError, error} = useQuery("posts", fetchPosts);

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
        <button disabled onClick={() => {}}>
          Previous page
        </button>
        <span>Page {currentPage + 1}</span>
        <button disabled onClick={() => {}}>
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

*/
