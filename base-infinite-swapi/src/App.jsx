import "./App.css";
import {InfinitePeople} from "./people/InfinitePeople";
import {InfiniteSpecies} from "./species/InfiniteSpecies";
import {QueryClientProvider, QueryClient} from "react-query";
import {ReactQueryDevtools} from "react-query/devtools";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <h1>Infinite SWAPI</h1>
        <InfinitePeople />
        {/* <InfiniteSpecies /> */}
        <ReactQueryDevtools initialIsOpen />
      </div>
    </QueryClientProvider>
  );
}

export default App;

/*

useInfiniteQuery vs useQuery
  - 반환 객체에서 반환된 데이터 프로퍼티의 형태가 다름
  - useQuery에서는 데이터는 단순히 쿼리 함수에서 반환되는 데이터
  - useInfiniteQuery에서는 객체는 두 개의 프로퍼티를 가지고 있음
      1. 데이터 페이지 객체의 배열인 페이지, 페이지에 있는 각 요소가 하나의 useQuery에서 받는 데이터에 해당(pages)
      2. pageParams, 각 페이지의 매개변수가 기록되어 있음(pageParams) → pageParams는 많이 사용되지는 않음.
  - 모든 쿼리는 페이지 배열에 고유한 요소를 가지고 있고, 그 요소는 해당 쿼리에 대한 데이터에 해당함.
  - 페이지 진행되면서 쿼리도 변경됨 
  - pageParams은 검색된 쿼리의 키를 추적함.
    - pageParams는 흔히 사용되지 않음, 여기서도 사용하지 않을 예정.

*/

/*

useInfiniteQuery 작동 원리
  - pageParam은 쿼리 함수에 전달되는 매개변수인데, 
    useInfiniteQuery("sw-people", ({pageParam = defaultUrl}) => fetchUrl(pageParam))
    - 쿼리 함수가 실행되는 동안, 매개변수, 객체를 구조 분해한 pageParam을 사용함.
    - 첫 번째 Url로 정의한 Url을 기본값으로 설정함.
    - 따라서, 함수는 이 defaultUrl을 기본값으로 하는 pageParam을 사용해서 해당 pageParam에서 fetchUrl을 실행함.
    - fetchUrl이 pageParam을 사용해서 적절한 페이지를 찾아 가져오는 것.
    - React-Query가 pageParam의 현재 값을 유지 함, 컴포넌트 상태 값의 일부가 아니다.
  - InfiniteQuery에 옵션을 사용하는 방식으로 이 작업을 실행함.
    - getNextPageParam: (lastPage, allPages) 옵션이 있는데, 다음페이지로 가는 방식을 정의하는 함수임.
    - 마지막 페이지의 데이터에서 또는 모든 페이지에 대한 데이터에서 가져옴, 이번 경우는 마지막 페이지(lastPage)에서 가져올 예정, 다음 페이지의 URL이 무엇인지 알려줌
      - pageParam을 업데이트해줍니다.
      - 데이터의 모든 페이지를 사용할 수도 있음, 우린 데이터의 마지막 페이지만 사용할 것, 구체적으로 말하면 next 프로퍼티임.

*/

/*

  useInfiniteQuery Return Object Properties
    - useQuery와는 다른 반환 객체의 몇 가지 프로퍼티가 존재함.
      - fetchNextPage
        : 사용자가 더 많은 데이터를 요청할 때 호출하는 함수이다.
        : 더 많은 데이터를 요청하는 버튼을 클릭하거나, 스크린에서 데이터가 소진되는 지점을 누르는 경우
      - hasNextPage
        : getNextPageParam 함수의 반환 값을 기반으로 하는데, 이 프로퍼티를 useInfiniteQuery에 전달해서, 마지막 쿼리의 데이터를 어떻게 사용할지 지시함. 
        : undefined인 경우, 더 이상 데이터가 없다는 거고, useInfiniteQuery에서 반환 객체와 함께 반환된 경우, hasNextPage는 false가 됨
      - isFetchingNextPage
        : useQuery에는 없는 개념인데, useInfiniteQuery는 다음 페이지를 가져오는지, 아니면 일반적인 페칭인지 구별할 수 있음.
          - 다음 페이지 페칭 / 현재 페이지든 다음이든 상관없는 일반적인 페칭을 구별하는 것이 왜 유용한가 와 같은 예시를 들 수 있음.

*/

/*

  무한 스크롤 도표
    - 컴포넌트가 마운트 됨, 이 시점에서 useInfiniteScroll이 반환한 객체의 data 프로퍼티가 정의되어 있지 않음. 아직, 쿼리를 만들지 않았기 때문
    - useInfiniteScroll은 쿼리 함수를 사용해서 첫 페이지를 가져옴, 쿼리 함수는 useInfiniteScroll의 첫 번째 인수고, pageParam을 인수로 받음, 따라서 첫 pageParam은 이 요소에서 우리가 기본값으로 정의한 것이 됨(defaultUrl)
    - 해당 pageParam을 사용해서, 첫 번째 페이지를 가져오고, 반환 객체 데이터의 페이지 프로퍼티를 설정, index가 0인 배열의 첫 번째 요소를 설정함(data.pages[0]), 그리고 이게 쿼리 함수가 반환하는 값이 됨.
    - 데이터가 반환된 후 React-query가 getNextPageParam을 실행함, 인자로 줬던 걸 기억할 거임, useInfiniteScroll의 옵션이라고 할 수 있음.
      getNextPageParam: (lastPage, allPage) => ... / getNextPageParam함수는 lastPage와 allPages를 사용해서 pageParam을 업데이트하는 함수
    - 다음 페이지가 있는지 확인하는 메서드는 hasNextPage임, 이 hasNextPage의 값을 결정하는 방식이 pageParam이 정의되어 있는지 아닌지에 따름
    - 사용자가 페이지에서 스크롤을 하든, 버튼을 클릭하든, fetchNexPage 함수를 트리거하는 어떤 행동을 했다고 가정해보자.
      - fetchNexPage 함수는 useInfiniteScroll이 반환하는 객체의 속성이다.
      - 컴포넌트가 구조 분해된 객체에서 가져온 fetchNexPage를 호출하며, 사용자가 더 많은 데이터를 요청할 때 그렇게 함, 그리고 이걸 사용해서 다음 요소를 업데이트하거나, 데이터 프로퍼티인 페이지 배열에 다음 요소를 추가함. 
    - 이제 또 새로운 데이터를 가지고 NextPageParam을 설정해보자(가정으로, 페이지에는 두 개의 page 데이터만 있다고 가정)
      - getNextPageParam을 실행할 때 nextPageParam은 정의되어 있지 않음
      - 그리고 hasNexPage로 돌아가보면, pageParams이 undefined이기 때문에 hasNextPage는 false가 된다.
      - hasNextPage가 거짓이라는 건 작업이 완료됐다는 것, 더 이상 수집할 데이터가 없음
*/
