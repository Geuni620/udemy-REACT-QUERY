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
