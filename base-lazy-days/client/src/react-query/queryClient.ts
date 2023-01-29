import { createStandaloneToast } from '@chakra-ui/react';
import { QueryClient } from 'react-query';

import { theme } from '../theme';

const toast = createStandaloneToast({ theme });

function queryErrorHandler(error: unknown): void {
  // error is type unknown because in js, anything can be an error (e.g. throw(5))
  const title =
    error instanceof Error ? error.message : 'error connecting to server';

  // prevent duplicate toasts
  toast.closeAll();
  toast({ title, status: 'error', variant: 'subtle', isClosable: true });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: queryErrorHandler,
    },
  },
});

/*
    
    onError의 대안
        1. React의 Error Boundary를 이용하는 것
        2. 이미 React 앱에서 Error Boundary를 사용하고 있을지도 모르지만, React-query의 에러를 따로 처리하고 싶지 않다면, useErrorBoundary 옵션을 사용하기
        3. 각 useQuery 및 useMutation에 옵션을 추가하거나, onError 핸들러에서 했던 것처럼 QueryClient를 생성할 때 기본 값 옵션을 만들 수 있음
        4. useErrorBoundary 옵션을 true로 설정하면, React-query내에서 에러를 처리하는 대신, 가까운 Error Boundary로 에러를 전파함 

    참고자료
    [useErrorBoundary](https://tanstack.com/query/latest/docs/react/reference/useQuery?from=reactQueryV3&original=https%3A%2F%2Freact-query-v3.tanstack.com%2Freference%2FuseQuery)

    [React Error Boundary](https://reactjs.org/docs/error-boundaries.html)


    [QueryClient](https://tanstack.com/query/v4/docs/react/reference/QueryClient) / 강의 내용이었음.
*/
