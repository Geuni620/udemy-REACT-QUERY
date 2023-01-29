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
