import {useQuery, useMutation} from "react-query";

async function fetchComments(postId) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/comments?postId=${postId}`
  );
  return response.json();
}

async function deletePost(postId) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/postId/${postId}`,
    {method: "DELETE"}
  );
  return response.json();
}

async function updatePost(postId) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/postId/${postId}`,
    {method: "PATCH", data: {title: "REACT QUERY FOREVER!!!!"}}
  );
  return response.json();
}

export function PostDetail({post}) {
  // replace with useQuery

  const {data, isLoading, isError, error} = useQuery(
    ["comments", post.id],
    () => fetchComments(post.id)
  );

  const deleteMutation = useMutation((postId) => deletePost(postId));
  const updateMutation = useMutation((postId) => updatePost(postId));

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
      <h3 style={{color: "blue"}}>{post.title}</h3>
      <button onClick={() => deleteMutation.mutate(post.id)}>Delete</button>
      {deleteMutation.isError && (
        <p style={{color: "red"}}>Error deleting the post</p>
      )}
      {deleteMutation.isLoading && (
        <p style={{color: "purple"}}>Deleting the post</p>
      )}
      {deleteMutation.isSuccess && (
        <p style={{color: "green"}}>Post has (not) been deleted</p>
      )}

      <button onClick={() => updateMutation.mutate(post.id)}>
        Update title
      </button>
      {updateMutation.isError && (
        <p style={{color: "red"}}>Error updating the post</p>
      )}
      {updateMutation.isLoading && (
        <p style={{color: "purple"}}>Updating the post</p>
      )}
      {updateMutation.isSuccess && (
        <p style={{color: "green"}}>Post has (not) been updated</p>
      )}
      <p>{post.body}</p>
      <h4>Comments</h4>
      {data.map((comment) => (
        <li key={comment.id}>
          {comment.email}: {comment.body}
        </li>
      ))}
    </>
  );
}

/*

11. why don't comments refresh?

    - 모든 쿼리가 comments 쿼리 키를 동일하게 사용하고 있기 때문
    - 이렇게 comments 같이 알려진 쿼리 키가 있을 때는 어떠한 트리거가 있어야만 데이터를 다시 가져옴.
      - 컴포넌트를 다시 마운트
      - 윈도우를 다시 포커스할 때
      - useQuery에서 반환되어 수동으로 리페칭을 실행할 때
      - 지정된 간격으로 리페칭을 자동 실행할 때
      - Mutation을 생성한 뒤 쿼리를 무효화할 시, 클라이언트 데이터가 서버의 데이터와 불일치 할 때 리페칭이 트리거 됨. 

    - 새 블로그 게시물 제목을 클릭할 때는 이런 트리거가 일어나지 않음.
      
*/
