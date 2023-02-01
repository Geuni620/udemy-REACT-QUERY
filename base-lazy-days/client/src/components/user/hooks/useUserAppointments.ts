import dayjs from 'dayjs';
import { useQuery } from 'react-query';

import type { Appointment, User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useUser } from './useUser';

// for when we need a query function for useQuery
async function getUserAppointments(
  user: User | null,
): Promise<Appointment[] | null> {
  if (!user) return null;
  const { data } = await axiosInstance.get(`/user/${user.id}/appointments`, {
    headers: getJWTHeader(user),
  });
  return data.appointments;
}

export function useUserAppointments(): Appointment[] {
  const { user } = useUser();
  const fallback: Appointment[] = [];
  const { data: userAppointments = fallback } = useQuery(
    [queryKeys.appointments, queryKeys.user, user?.id],
    () => getUserAppointments(user),
    {
      enabled: !!user,
    },
    /*
        61. 의존적 쿼리: userAppointments
          - 여기서 일단 쿼리 키는 하드코딩 해주었음("user-appointments")
          - enabled: !!user로 설정한 이유는
            - enabled가 false이면 query가 실행되지 않음.
            - user로 했을 때 boolean type이 아님, 그리고 !user했을 땐 user가 거짓일 경우, enabled 되면 안되기 때문에 !!user로 설정함.
            
          - user 쿼리에 6개의 옵저버가 있는데(devTools를 보면), 이 옵저버는 바로 useUser를 실행하는 앱의 모든 컴포넌트가 쿼리를 "구독"하고 있기 때문임.
            - 사용자 예약 현황과 사용자 정보가 각각 하나의 컴포넌트고, 상단에 로그인 정보도 하나의 컴포넌트임.
            - 이처럼 모든 컴포넌트가 해당 쿼리를 참고하고 있음.
          
          - react-query의 장점은 새로운 데이터가 있을 때 새 데이터를 위해 서버에 핑을 실행하기보다 캐시에서 데이터를 가져온다는 점.
          - 데이터가 만료상태여도 React-query는 서버에 새로 연결하지 않음.
          - 기존에 이미 실행되고 있다면 React-query가 서버로 중복되는 요청을 제거하기 때문에 여러 요청이 있어도 동시에 실행되지 않음.
          - 이미 진행 중인 요청을 구독한다면 해당 요청에 포함 됨
    */
  );

  return userAppointments;
}

/*

  해당 내용 확인하게 된다면, 강의 68. 내용 후반부 체크하기

*/
