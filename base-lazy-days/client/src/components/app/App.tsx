import { ChakraProvider } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import { queryClient } from '../../react-query/queryClient';
import { theme } from '../../theme';
import { Loading } from './Loading';
import { Navbar } from './Navbar';
import { Routes } from './Routes';

export function App(): ReactElement {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Navbar />
        <Loading />
        <Routes />
        <ReactQueryDevtools initialIsOpen />
      </QueryClientProvider>
    </ChakraProvider>
  );
}

/*
  
  react-query dev tools
    - NODE_ENV가 Production으로 설정되었을 때는 표시되지 않음.
    - CRA에서 npm start를 실행하면, NODE_ENV는 개발모드로 실행함

*/

/*

  custom hooks를 사용하는 이유
    - 다수의 useQuery 호출을 사용했다면, 사용 중인 키의 종류가 헷갈릴 수 있음
    - custom hooks을 사용해 매번 호출한다면 키를 헷갈릴 위험이 없음.
    - 사용하길 원하는 쿼리 함수를 혼동하는 위험도 없음.

*/

/*

  쿼리 함수가 에러를 발생시키면 onError 콜백이 실행되는데 React-query가 콜백에 에러 매개변수를 전달하기 때문에 다양한 방법으로 에러처리가 가능함
    - Toast를 이용해서 하단에 나타나는 메세지를 통해 Error을 띄워보려고 함.
    - Chakra UI에 탑재된 useToast hook을 사용함

*/

/*

  Prefetch ang Pagination (쿼리특성 I)
    - React-query로 데이터를 미리 채우는 방법에 대해 알아보자

    - 일반적으로 사용자에게 보여주고 싶은 정보가 있을 때, 캐시에 아직 데이터가 없는 경우 미리 데이터를 채울 수 있음. / (added to cache)
    - 유효한 데이터면 캐시에 추가할 수 있지만, 자리 표시자 데이터(?)인 경우엔 추가하지 않음.
    - 데이터는 클라이언트 또는 서버에서 올 수도 있고 (data from), 사용할 위치는 미리 채우기 옵션이 사용될 React-query method를 말함. (where to use?)

  PrefetchQuery, queryClient에 대한 메서드임
    - where to use? method to queryClient
    - data from? server, 데이터는 서버에서 오기 때문에 데이터를 가져오기 위해 서버로 이동하고, 데이터는 캐시에 추가됨.
    - added to cache? yes

  setQueryData, useQuery를 실행하지 않고, 쿼리 데이터를 캐시에 추가하는 또 다른 방법, 이것 또한 queryClient를 사용하는 메서드 
    - where to use? method to queryClient
    - data from? client, 데이터는 클라이언트에서 가져옴,
                         따라서 서버에서 mutation에 대한 응답으로 나온 데이터일 수 있음,
    - added to cache? yes, queryClient에서 setQueryData 메소드를 사용하여 캐시에 데이터를 추가하면,
                           useQuery가 데이터를 요청할 때 캐시가 해당 데이터를 제공하도록 할 수 있음.

  placeholderData, useQuery에 대한 옵션으로, placeholderData가 있음.
    - where to use? option to useQuery
    - data from? client, useQuery를 실행할 때 데이터를 제공하기 때문에 클라이언트에서 데이터를 가져오고 
    - added to cache? no, 캐시에는 추가되지 않음, placeholderData는 고정값, 또는 함수를 사용할 수 있음,
                          자리표시자 데이터값을 동적으로 결정하는 함수를 사용하려는 경우, placeholderData를 사용하는 것이 가장 좋음
                          예를 들면, 빈 배열이었던 treatments나 staff와 같이 고정된 값이 있는 경우 반환 배열을 구조 분해할 때, 해당 값을 기본값으로 할당하는 것이 좀 더 수월하다.
                          placeholderData는 자리 표시자가 필요한 경우에만 사용함, 달리 표시할 데이터가 없는 경우 사용하는 표시용 데이터일 뿐이며, 다시 사용할 일이 없기 때문에, 캐시에 추가하지 않음.

  * 여기서 말하는 "자리표시자"는 데이터가 랜더링 되기 이전에 표시되어야하는 데이터를 말하는 듯함.

  initialData, useQuery에 대한 옵션으로, 클라이언트에서 제공 됨.
    - where to use? option to useQuery
    - data from? client
    - added to cache? yes, placeholder data와 달리 캐시에 추가해야 하는 데이터임, 이것이 이 쿼리에 대한 유효한 데이터임을 공식적인 기록에 선언해 둘 필요가 있음.

  다음 강의에서는 애플리케이션 홈페이지 로드시, treatments 프리페칭에 대해 알아보자
*/

/*

  Prefetch Treatments
    - Prefetch는 사용자가 현재 페이지를 보고 있는 동안, 다음 페이지를 미리 가져와서 사용자가 다음 페이지 버튼을 클릭할 때, 기다릴 필요가 없도록 했던 기능이다.
    - 여기에서는 다른 트리거를 살펴볼텐데, 사용자가 전체 페이지를 로드할 때, Treatments 데이터를 미리 가져와 보려고 함.
      - 홈페이지 로드 중 높은 비율로 Treatments 탭으로 이어진다는 사용자 연구 결과가 있다고 가정해보자.
      - 이런 경우 사용자가 Treatments 탭을 클릭할 때 기다릴 필요 없도록, Treatments 데이터를 미리 가져오는 것이 좋음.
      - Treatments 데이터는 비교적 안정적이기 때문에, Prefetching에 특히 적합함.
      - 주식 시세와 같이 동적인 데이터를 가져오는 것이 아니기 때문에, 캐시된 데이터에 의존하더라도, 그다지 문제가 되지 않음.
    - 물론 캐시 시간 내에 useQuery로 데이터를 호출하지 않으면, 가비지 컬렉션으로 수집된다.
      캐시 시간 내에 캐시에 보관할 필요가 없는, 유용하지 않는 데이터를 구분하고, 이를 가비지 컬렉터에 포함함.
      - 만약 사용자가 기본 캐시시간, 즉 5분 이내에 Treatments 탭을 로드하지 않는다면, 캐시 시간을 더 길게 지정할 수도 있음.

    - PrefetchQuery는 queryClient의 메서드임. 
      - 따라서 useQuery와 달리 클라이언트 캐시에 추가됨, useQuery는 Fetching과 Refetching 등의 작업에 필요한 쿼리를 생성하지만, prefetchQuery는 일회성이다. 
    - queryClient 메소드이므로 queryClient를 반환해야 하며, 이를 위해 useQuery 클라이언트 hook을 사용함.
    - usePrefetchTreatments라는 useTreatments 파일에 또 다른 훅을 만들 것인데, useTreatments, useQuery 호출과 동일한 쿼리함수와 쿼리키를 사용하기 때문에, 동일한 파일에 보관할 예정. 
    - 요점은 Home 컴포넌트에서 usePrefetchTreatments hooks를 호출한다는 것
      - 그렇게하면 데이터가 캐시에 미리 로드되고, 캐시 시간이 다 되기 전에 사용자가 Treatments 페이지로 이동하는 한, 캐시된 데이터를 표시할 수 있기 때문에 사용자는 서버 호출을 할 때까지 기다릴 필요가 없음.

*/

/*
  
  Prefetching Treatments는 사용자가 홈페이지를 로드할 때 시작됨.
    1. 홈페이지를 로드할 때 queryClient.prefetchQuery를 호출하고, 이를 통해 Treatments 데이터가 캐시에 추가됨.
    2. 그런 다음 사용자가 Treatments 페이지를 로드함, 쿼리를 처음 프리페칭한 시점을 기준으로, 캐시 시간이 초과하지 않는 경우,
       Treatments 데이터가 캐시에 로드됨, 뿐만 아니라 useQuery는 새로운 데이터를 가져옴. 컴포넌트를 마운트하여 리페칭을 트리거했기 때문(데이터가 만료(stale)되었다는 것을 알기 때문), 그리고 리페칭 동안에는 캐시된 데이터를 사용자에게 보여줌.
    3. 만약 캐시 시간이 지났다면, 할 수 있는 일은 많지 않음. 데이터는 가비지 컬렉션에 수집되었고, useQuery는 그동안 표시할 데이터 없이 데이터를 가져와야 함

*/

// ---- 섹션 6. 쿼리 특성 II ---- //

/*
  
    Select 옵션을 사용해보자
      - React-query는 불필요한 연산을 줄이는 최적화를 하는데, 이를 메모이제이션이라고 함.
        - React-query의 select 함수는 삼중 등호로 비교하며, 데이터와 함수가 모두 변경되었을 경우에만 실행 됨.
        - 마지막으로 검색한 데이터와 동일한 데이터이고, Select 함수에도 변동이 없으면 Select 함수는 재실행하지 않는 것이 React-query의 최적화임
        - 따라서 select 함수에는 안정적인 함수가 필요함, 매번 바뀌는 익명 함수, 즉 삼중 등호로 비교하는 함수는 실패함.
        - 익명 함수를 안정적인 함수로 만들고 싶을 때는, "useCallback"을 사용하면 됨.
        

      [React Query Data Transformations](https://tkdodo.eu/blog/react-query-data-transformations)

*/

/*

   Re-fetching! Why? When?
   리페칭을 제한할지, 폴링할지
    - 리페칭을 위해서 염두해 둬야할 사항
      - 서버가 만료 데이터를 업데이트 한다는 것, 즉 일정 시간이 지나면 서버가 만료된 데이터를 삭제하는데, 개발자의 의지와는 상관이 없음.
      - 이런 리페칭은 페이지를 벗어났다가 다시 돌아왔을 때 볼 수 있음.
        - 우리가 만들고 있는 spa 페이지에서 staff 페이지를 열어놨다가 dev tools로 갔다가 다시 focus하면 작은 로딩 인디케이터가 표시 됨
        - 우리가 이 창을 재포커스 할 때마다 데이터를 다시 가져오는 것
        - staleTime이 0으로 설정되어 있다면, 화면을 로딩하고 데이터를 가져오자마자 이 데이터는 stale 된 데이터가 됨.
          - 이 때, 또 다시 dev tools로 갔다가 staff 페이지를 focus하면, 만료되었던 데이터를 가져오기 함.
          - 서버를 통해 데이터가 업데이트 안 된게 확실한지 확인해야하는 인디케이터임.
    
    - stale 쿼리는 어떤 조건 하에서 자동적으로 다시 가져오기가 됨.
      - 새로운 쿼리 인스턴스가 많아지거나, 쿼리 키가 처음 호출된다거나, 쿼리를 호출하는 반응 컴포넌트를 증가시킨다거나, 또는 위에서처럼 창을 재포커스 한다거나.
        만료된 데이터의 업데이트 여부를 확인할 수 있는 네트워크가 다시 연결된 경우에 리페칭이 일어남.
      - 또는, 리페칭 간격이 지난 경우도 해당되는데, 이 경우는 간격에 리페칭을 해서 서버를 폴링하고, 사용자 조치가 없더라도 데이터가 업데이트 되는 경우임.

*/

/*
    Re-fetching! How?
      - 옵션으로 제어를 할 수 있는데, 일반적인 경우인 전역일 수도 있고, 호출 쿼리 사용에 특정된 것일 수도 있음.
        - refetchOnMount, refetchOnWindowFocus, refetchOnReconnect, refetchOnInterval 등이 있음.
          - 앞의 3가지는 불리언이고, 마지막은 밀리 초 단위의 시간임.

      - 리 페칭을 명령할 수도 있어서 useQuery를 쓰면 객체를 반환함, 데이터나 오류 같은 것인데, refetch 함수를 반환하기도 함, 불러오는 데이터가 있을 때 호출하는 방법임.
      - 첫 3가지 옵션의 불리언 값이 모두 참으로 설정되어 있음(default)
      
      - 리 페칭을 제한하고 싶을 때도 있음
        - 이럴 땐, staleTime을 증가시키면 되는데, 창을 재포커스하거나, 네트워크에 재연결하는 트리거는, 데이터가 실제로 만료된 경우에만 작용을 하기 때문.
        - 아니면 3가지 불리언 옵션 중 하나 혹은 전체를 끄면 됨. 
      - 리 페칭을 제한할 땐 신중해야 함.
        - 변동이 잦지 않은 데이터에 적용해야 하며, 미세한 변동에도 큰 변화를 불러오는 데이터에는 적용하지 말야아 함.
      - 이 수업에서는 서비스와 직원이 해당할 것, 서비스와 직원 정보는 자주 변하지 않을 거니까, 리 페칭을 제한해도 괜찮음.
      - 반면 실시간 정보가 중요한 예약은 사용자에게 훨씬 중요한 데이터임.

      - '이럴 만한 가치가 있을까?' 라고 늘 물어보게 되는데, 리페칭을 제한하면, 네트워크 호출을 줄일 수 있음.
      
        

*/
