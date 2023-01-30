import { useQuery, useQueryClient } from 'react-query';

import type { Treatment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';

// for when we need a query function for useQuery
async function getTreatments(): Promise<Treatment[]> {
  const { data } = await axiosInstance.get('/treatments');
  return data;
}

export function useTreatments(): Treatment[] {
  const fallback = [];
  const { data = fallback } = useQuery(queryKeys.treatments, getTreatments, {
    staleTime: 60000, // 10 minutes

    /*
      refetching을 제한하기 위해 staleTime을 10분으로 설정했는데, cacheTime이 default 5분임
      staleTime이 cacheTime을 초과한다는 건 말이 안됨.
        - 만료된(stale) 데이터를 불러오는 동안, 캐싱(cache)에 백업된 내용이 보여질 것,
        - 그러니 만료된 데이터(stale)보다 캐싱(cache)이 먼저 만료된다는 것은 리페칭을 실행시키는 동안 보여 줄 화면이 없다는 것.
        - 즉, 캐싱타임도 증가시키겠음.
    */
    cacheTime: 900000, // 15 minutes, (doesn't make sense for staleTime to exceed)
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,

    /*

       위와 같이 설정하면, 다음과 같이 동작함.
        - home page에 들어가면 prefetching에서 설정이 안걸려있기 때문에 fetch가 되고, update가 일어남
        - 하지만 Treatments로 이동하면 update되지 않고, 기존의 데이터를 그대로 사용함.
        - staff page로 가면 staleTime이 0으로 설정되어 있기 때문에 들어가서 unfocus 했다가 focus하면 update가 발생.

    */
  });

  return data;
}

export function usePrefetchTreatments(): void {
  const queryClient = useQueryClient();
  queryClient.prefetchQuery(queryKeys.treatments, getTreatments, {
    staleTime: 60000,
    cacheTime: 900000,
  });

  /*
    prefetchQuery에 사용되는 key는 캐시에서 어느 useQuery가 이 데이터를 찾아야 하는지 알려주기 때문에 매우매우 중요하다.
    그리고 캐시에 있는 이 데이터가 이 useQuery 호출과 일치한다고 알려 주는 것임
    이후엔 useQuery 호출과 같은 방법을 사용할 것
  */
}

/*

  useQuery를 사용할 때 인수를 전달하지 않으므로, 인수를 전달하기 위해 익명 함수를 호출할 필요는 없음
  () => getTreatments() → getTreatments

*/

/*
  
  useTreatments에 오류 핸들링을 집중화
    - 모든 useQuery호출에 오류 핸들링 방식을 적용해서, 각 호출에 따로 지정하지 않도록 만드려고 함.
    - 처음에는 "왜 React-query가 useIsFetching hook에 상응하는 useError hook을 제공하지 않는가?"를 고민했음
    - 그러면 Toast 컴포넌트가 오류를 나타내기 위해 팝업할 때, 집중적으로 사용할 수 있을텐데 말이죠.
    - 하지만 더 깊이 고민해보니, useError 훅이 존재할 수 없다는 것을 깨닫게 되었음.
      - 정수 이상의 값이 반환되야 하기 때문, 사용자에게 오류를 표시하려면 각 오류에 대한 문자열이 필요한데, 각기 다른 문자열을 가진 오류가 시시각각 팝업하도록 구현하기란 쉽지 않음
      - useIsFetching가 깔끔하게 현재 가져오는 쿼리의 번호를 주는 것과 다름
    - 따라서, 집중식 훅 대신 QueryClient를 위해 onError 핸들러 기본값을 만들어보자
      - 일반적으로 QueryClient는 쿼리나, Mutation에 대해 기본값을 가질 수 있음.
      - QueryClient는 options 객체를 가질 수 있는데, 역시 두 가지 프로퍼티가 가능함.
        {
          queries: {useQuery options},
          mutations: {useMutation options}
        }
      - queries 프로퍼티는 useQuery에 추가하는 options 형식의 값을 가지고, mutations 프로퍼티의 값은 useMutation에 추가하는 options 형식을 가짐
      - useTreatments에 있는 onError를 QueryClient에 전송해서, 모든 useQuery 호출에 적용해보자.


*/
