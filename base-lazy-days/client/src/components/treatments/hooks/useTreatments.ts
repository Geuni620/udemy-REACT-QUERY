import { useQuery } from 'react-query';

import type { Treatment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';

// for when we need a query function for useQuery
async function getTreatments(): Promise<Treatment[]> {
  const { data } = await axiosInstance.get('/treatments');
  return data;
}

export function useTreatments(): Treatment[] {
  // TODO: get data from server via useQuery
  const toast = useCustomToast();

  const fallback = [];
  const { data = fallback } = useQuery(
    queryKeys.treatments,
    getTreatments,

    {
      onError: (error) => {
        const title =
          error instanceof Error
            ? error.message
            : 'error connecting to the server';

        toast({ title, status: 'error' });
      },
    },
  );

  return data;
}

/*

  useQuery를 사용할 때 인수를 전달하지 않으므로, 인수를 전달하기 위해 익명 함수를 호출할 필요는 없음
  () => getTreatments() → getTreatments

*/
