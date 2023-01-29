import { useQuery } from 'react-query';

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
  const { data = fallback } = useQuery(queryKeys.treatments, getTreatments);

  return data;
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
