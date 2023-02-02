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

/*

    전역 리페치 옵션 설정
      - appointments를 제외한 나머지에 기본 설정으로 Refetching 옵션을 제한해보자.
        - useProfile을 업데이트하면 프로필 정보가, 예약정보를 업데이트하면 예약정보가 변경될 것.
        - 우리는 이 2가지를 다른 리페칭 방식으로 처리할 거임.
        - Mutation을 만들어 데이터를 무효화시키면, 리페칭이 되는 것.
        - 리페칭 옵션의 기본 값이 엄격한 것은 아니라, 실시간으로 리페칭을 해야하는 '사용자 프로필'과 '예약 사항'에 적합함.
        - appointments는 이런 기본 값을 오버라이드하는 설정이 들어갈 것.
          - 만료시간(staleTime)이 0이 되고, 캐시 시간은 제한 됨.
          - 폴링 간격도 설정해서, 주기적으로 데이터를 서버에서 불러올 것.
        - global options의 위치는 src/react-query/queryClient.ts임


*/

/*

    54. 폴링: 간격에 따른 자동 리페칭
      - 이제 리페칭 간격 옵션을 사용하고, 이것으로 시간 간격에 따라 리페칭 할 것.
      - useUserAppointments 훅을 깊이 있게 다루지 않았음(주로 useAppointments를 다룸)
        - 이 훅은 '로그인 한 사용자의 모든 예약 사항을 검색함', 사용자 페이지 화면을 위해서.
        - useAppointments의 훅과는 다른데, 이 훅은 '모든 사용자의 예약을 검색함'. 단, 현재 월과 년도의 경우만.
        - 반면, useUserAppointments는 로그인 한 사용자의 예약만 검색하며, 월, 년도와 상관없이 모든 사항을 검색함.
        - 그렇다면, useUserAppointments가 리페칭 기본 값과 어울릴 수 있을까? → 그렇다.(자주 호출할 필요 없음.)
          - 왜냐하면 React code 모르게 업데이트 될 수 없기 때문, React 코드가 트리거를 해야 어떤 변경이든 일어남.
          - Mutation을 활용해 데이터를 무효화시키고 다시 불러오는 거죠.
          - React client 모르게 서버에서 변경 되는 것은 appointments가 유일함.(이건 refetching 되어야함.)
          - 이런 상황이 주기적으로 발생하도록 리페칭 간격을 사용해보겠음.(= 폴링)

*/

/*

    64. 변이(Mutation)와 변이 전역 설정 입문
      - 서버 데이터가 업데이트될 것이기 때문에, 쿼리 무효화에 대해서도 살펴볼 것.
        - 이를 통해 데이터가 캐시에서 제거되고, 리페치를 트리거 할 수 있음.
        - 또한 변이를 보내고 서버에서 새 데이터를 다시 받을 때 캐시를 업데이트함.
          - 예를 들어 전화번호와 같은 사용자 데이터를 업데이트하면, 서버는 캐시를 직접 업데이트하는 데 사용할 수 있는 새 사용자 객체를 반환 함.
        - 낙관적 업데이트(Optimistic Update)에 대해서도 살펴볼 것.
          - 여기서 낙관적인 업데이트는 변이가 성공하기를 희망하지만, 실패하더라도 롤백할 수 있다는 의미.
      
      - 쿼리에 했던 것과 동일한 방식으로 변이에 대한 전역 페칭(fetching) 인디케이터 및 오류 처리(Error handing)를 설정하려고 함.
        - 쿼리와 매우 유사한데, 오류의 경우 기본적으로 쿼리 클라이언트 defaultOptions의 mutation 속성에서 onError 콜백을 설정함.
        - 여기서 이 defaultOptions는 지금까지 업데이트 한 쿼리 속성과 변이 속성을 '모두' 가지고 있음.
        - Loading 인디케이터의 경우 useIsMutating이 있으며 useIsFetching과 유사하지만, 변이 호출 중 현재 해결되지 않는 것이 있는지 알려줌.
        - 따라서, isMutating 또는 isFetching에 표시되도록 Loading 컴포넌트를 업데이트 할 거임.

*/

/*

    57. useAuth, useUser와 useQuery
      - useAuth 훅은 로그인과 가입, 로그아웃 기능을 제공함.
      - useUser 훅은 React-query가 작동하는 곳, 사용자 데이터와 사용자 정보를 업데이트하는 함수가 있음.
        - updateUser는 사용자 로그인이나 사용자 정보 업데이트를 처리하고, clearUser는 로그아웃을 처리함.
        - useUser의 책임은 로컬 스토리지와 쿼리 캐시에서 사용자의 상태를 유지하는 거임.
        - useAuth의 책임은 이러한 함수들이 서버로 통신하도록 하는 것.

*/

/*

    56. React-Query와 인증 입문
      - 인증된 앱의 Auth로 React-query를 통합하는 거임.
      - 이번 세션에서는 어떤 조건 하에서만 활성화가 되는, 의존적 쿼리(Dependent Queries)를 학습하고 쿼리 클라이언트에 관한 몇 가지 새로운 방식을 학습하겠음.
        - setQueryData는 실제로 캐시에 데이터를 설정하기 위함이고, removeQueries는 캐시에서 쿼리를 삭제하기 위함임
        - 이 앱에서는 토큰이 사용자 객체에 저장되어 있음, 서버로부터 전달된 사용자 객체가 이 토큰을 담고 있고 클라이언트에서 사용했듯이 이 사용자 객체도 토큰을 담고 있음

      - 누가 사용자 데이터를 소유해야할까?
        - signIn, signOut, signUp 함수를 useAuth 훅에서 관리할까?
        - 쿼리 캐시가 있는 useQuery는 어떨까요?
        - 사용자 데이터에 있어서는 뭐가 정답일까요?
        - signIn, signUp, signOut 실행 시 useAuth가 useQuery를 호출해야할까요? 아니면 Axios로 직접 호출해야할까요?
        - 그리고 useAuth가 Provider를 써야할까요? useAuth는 로그인 정보와 데이터를 관리하는 콘텍스트를 필요로 할까요? 혹은 사용자 데이터를 react-query 캐시에 저장하면 될까요?

      - React-query와 useAuth 훅의 구체적인 책임을 생각해본다면 도움이 될것
        - React-query의 책임은 클라이언트의 서버 상태를 관리하는 것
        - useAuth 훅의 책임은 signIn, signOut, signUp 함수를 제공하는 것, 그래서 서버에 있는 사용자를 인증할 수 있는 것.
        - 이 두 가지는 전혀 다른 이야기임, 결론은 데이터 저장은 React-query에 하는게 맞고, 그러려면 useUser라는 특별한 훅이 필요함
        - React-query는 데이터를 저장하고 useAuth는 지원을 할거임, 서버를 호출할 때 useAuth가 사용자 데이터를 수집하기 때문.
          - 서버는 useAuth의 signIn, signUp 호출 시 데이터를 반환함, 우리가 할 일은 useUser의 함수로 이런 내용을 캐시에 추가하는 것
        
        - useUser 훅의 역할에 관해 이야기해보자
          - 이건 React-query로부터 사용자 데이터를 반환할 책임이 있음, 우리가 쿼리 캐시에 사용자 데이터를 저장한다는 걸 잊지말 것
          - 그리고 useUser 훅은 객체를 반환함, 객체 항목 중 하나가 이 사용자 데이터가 되는 것.
          - useUser라는 이름의 훅에서 알 수 있듯이, user 데이터를 반환하는 거임.
          - localStorage의 데이터를 로딩해서 초기 설정을 할 거임, 사용자가 페이지를 새로 고침할 때 데이터를 유지하는 방법임
            - 특히 변이가 일어나면 서버의 사용자 데이터가 변경될 거임, 그리고 React useQuery 훅을 사용해서, 사용자 데이터를 항상 최신으로 유지해야함.
            - useQuery 인스턴스의 쿼리 함수는 로그인 한 사용자의 ID와 함께 서버에 요청을 보낼 거임, 그럼 서버가 그 사용자에 관한 데이터를 돌려보내줌.
              - 만약 로그인 한 사용자가 없다면 쿼리 함수는 null을 반환할 거임, 
          - useUser의 역할은 우리 앱의 특정 인스턴스까지 로그인한 사용자를 추적하는 거임, 그리고 정보다 업데이트되면 즉, 접속을 했다거나 접속에서 나갔다거나 혹은 사용자가 스스로 업데이트를 했다거나 이럴 경우 setQueryData로 직접 React-query 캐시를 업데이트 함, 그리고 localStorage도 업데이트 함.
            - localStorage 업데이트는 onSuccess 콜백에서 진행되며 useQuery까지 업데이트 함, 그리고 onSuccess 콜백은 setQueryData와 쿼리 함수가 실행된 이후에 실행 됨.
          - 어떤 방식으로든 쿼리 캐시는 업데이트가 되는데 setQueryData를 통해 업데이트 되거나 쿼리 함수가 실행될 때 생긴 변이 뒤에 업데이트 될 수 있음.
        
        - 사용자 데이터를 Auth Provider에 저장할 수는 없을까?
          - 당연히 가능, 흔히들 옵션으로 되어있음, 단점이라면 이미 복잡한 시스템에 복잡함을 더한다는 것, React Query 캐시에서 분리된 Provider 관리도 포함
          - 불필요한 데이터가 생긴다는 것도 단점.
          - 사용자 변이를 허용한다면 그 사용자 데이터를 React Query에 보관하고 싶을 텐데 Auth Provider에도 사용자 데이터를 입력해야함
          - 새로운 애플리케이션을 개발한다면 당연히 React Query 캐시에 사용자 데이터를 저장하고 Auth Provider는 잊고 싶음
          - 하지만 Legacy project에서는 Auth Provider를 관리하고 React Query 캐시를 필요 위치에 추가하는 것이 더 합당함.

*/

/*

  70. 변이(mutation) 응답으로 사용자와 쿼리 캐시 업데이트하기
      - 


*/

/*
  
  71. React-query의 낙관적 업데이트 입문
      - 낙관적인 업데이트는 서버로부터 응답을 받기 전 사용자 캐시를 업데이트하는 건데, 우리가 새 값이 무엇인지 알고 있는 경우에요
      - 예를 들면 789 Elm Street를 사용하는 사용자예요 이 경우 우린 변이가 작동할 거라고 낙관합니다 서버에서 문제없이 작동할 걸로 추정하는 거죠
      - 장점은 캐시가 더 빨리 업데이트된다는 건데요, 캐시를 업데이트하기 위해 서버 응답을 기다릴 필요가 없어요
      - 특히 복수의 컴포넌트가 이 데이터를 사용하는 경우 앱은 사용자에게 훨씬 더 민감하게 반응하죠

      - 단점은 서버 업데이트가 실패한 경우 코드가 더 복잡해진다는 거예요, 이 경우 업데이트 이전의 데이터로 되돌려야 해요 해당 데이터를 저장해둬야 한다는 거죠 
      - useMutation에는 onMutate 콜백이 있어요
      - 이것이 콘텍스트 값을 반환하고 onError 핸들러가 이 콘텍스트 값을 인수로 받아요
      - 에러가 생기면 onError 핸들러가 호출되고 onError 핸들러가 콘텍스트 값을 받아서 캐시 값을 이전으로 복원할 수 있게 되죠
      - 이 경우 콘텍스트는 낙관적 업데이트를 적용하기 전의 콘텍스트를 의미합니다
      - 캐시를 업데이트할 데이터를 포함하는 특정 쿼리에서 onMutate 함수는 진행 중인 모든 리페치(Refetch)를 취소해요

      - 중요한 부분인데요 쿼리를 취소하지 않으면 쿼리를 다시 가져올 수 있어요
      - 리페치가 진행되는 동안 캐시를 업데이트하는데 서버에서 다시 가져온 이전 데이터로 캐시를 덮어쓰게 되는 거죠
      - 그래서 낙관적 업데이트를 한 후에 이전 데이터로 캐시를 덮어쓰지 않도록 쿼리를 취소해야 합니다
    
  72. 쿼리 "취소 가능하게" 만들기
      - React Query는 AbortController 인터페이스로 쿼리를 취소합니다 표준 JavaScript 인터페이스에 해당하죠
      - 핵심은 AbortSignal 객체를 DOM 요청에 보내는 것입니다 더 자세하게 알아보고 싶으시다면 여기 MDN 페이지를 읽어 보세요
      - 예를 들어 어떤 쿼리가 가동 중에 기한이 만료하거나 비활성되는 경우 내지는 예를 들면 쿼리 결과를 보여주는 컴포넌트가 해제되는 경우가 있겠죠
      - React Query에서 이 방법을 사용해 Axios 쿼리를 수동으로 취소하려면 Axios에 중단한다는 신호를 전달해야 합니다
      - 이 중단한다는 신호를 쿼리 함수에 인수로 전달됩니다 지금은 추상적으로 느껴지실 수 있는데 코드를 구현하게 되면 더 의미가 와닿습니다
 */
