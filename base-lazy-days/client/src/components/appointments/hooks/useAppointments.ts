// @ts-nocheck
import dayjs from 'dayjs';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useUser } from '../../user/hooks/useUser';
import { AppointmentDateMap } from '../types';
import { getAvailableAppointments } from '../utils';
import { getMonthYearDetails, getNewMonthYear, MonthYear } from './monthYear';

// for useQuery call
async function getAppointments(
  year: string,
  month: string,
): Promise<AppointmentDateMap> {
  const { data } = await axiosInstance.get(`/appointments/${year}/${month}`);
  return data;
}

// types for hook return object
interface UseAppointments {
  appointments: AppointmentDateMap;
  monthYear: MonthYear;
  updateMonthYear: (monthIncrement: number) => void;
  showAll: boolean;
  setShowAll: Dispatch<SetStateAction<boolean>>;
}

// The purpose of this hook:
//   1. track the current month/year (aka monthYear) selected by the user
//     1a. provide a way to update state
//   2. return the appointments for that particular monthYear
//     2a. return in AppointmentDateMap format (appointment arrays indexed by day of month)
//     2b. prefetch the appointments for adjacent monthYears
//   3. track the state of the filter (all appointments / available appointments)
//     3a. return the only the applicable appointments for the current monthYear

/*
  1. 첫 번째는 현재 월과연도를 추적하는 것, 이것을 사용자가 선택한 monthYear이라고 하겠음
    - 그런 다음 monthYear를 업데이트하는 방법도 필요함.
  2. 해당 monthYear에 대한 appointments를 반환해야 함
    - AppointmenthDateMap 형식으로 반환하고
    - 해당 monthYear의 이전 달과 다음 달의 appointments를 프리페칭함.
      - 이전 달과 다음 달로 이동시 기다리지 않게 하기 위함
  
  3. 마지막으로 필터의 상태를 추적함.
    - 캘린터에서 예약된 날짜를 포함해 모든 날짜를 표시하거나,
    - 예약되지 않은 날짜만 필터링할 수 있도록 구현
*/

// common options for both useQuery and prefetchQuery
const commonOptions = {
  staleTime: 0,
  cacheTime: 300000, // 5 minutes
};

export function useAppointments(): UseAppointments {
  /** ****************** START 1: monthYear state *********************** */
  // get the monthYear for the current date (for default monthYear state)
  const currentMonthYear = getMonthYearDetails(dayjs());

  // state to track current monthYear chosen by user
  // state value is returned in hook return object
  const [monthYear, setMonthYear] = useState(currentMonthYear);

  // setter to update monthYear obj in state when user changes month in view,
  // returned in hook return object
  function updateMonthYear(monthIncrement: number): void {
    setMonthYear((prevData) => getNewMonthYear(prevData, monthIncrement));
  }
  /** ****************** END 1: monthYear state ************************* */

  /** ****************** START 2: filter appointments  ****************** */
  // State and functions for filtering appointments to show all or only available
  const [showAll, setShowAll] = useState(false);

  // We will need imported function getAvailableAppointments here
  // We need the user to pass to getAvailableAppointments so we can show
  //   appointments that the logged-in user has reserved (in white)
  const { user } = useUser();

  const selectFn = useCallback(
    (data) => {
      // TODO: write function
      return getAvailableAppointments(data, user);

      /*

      이 appointments 데이터는 사실 useQuery가 select 함수를 실행할 때 얻는 data임.

      selectFn함수는 익명함수임.
        - 따라서, 언급했던 최적화를 수행하지 않는다.
        - 최적화는 데이터의 변경여부와 함수의 변경 여부를 확인하고, 변경사항이 없으면 해당 함수를 다시 실행하지 않는 것.
        - 이 selectFn함수는 훅에 있을 때마다 변경될 것.
          - 이를 안정적인 함수로 만들기 위해 useCallback을 실행하겠음.
          - dependency Array에 user를 넣어줌.
          - 사용자가 로그인, 로그아웃 할 때마다 이 함수를 변경해야 할 것.

      */
    },
    [user],
  );

  /** ****************** END 2: filter appointments  ******************** */

  /** ****************** START 3: useQuery  ***************************** */
  // useQuery call for appointments for the current monthYear

  const queryClient = useQueryClient();
  useEffect(() => {
    const nextMonthYear = getNewMonthYear(monthYear, 1);

    queryClient.prefetchQuery(
      [queryKeys.appointments, nextMonthYear.year, nextMonthYear.month],
      () => getAppointments(nextMonthYear.year, nextMonthYear.month),
      commonOptions,
    );
  }, [monthYear, queryClient]);

  /*
      1. dependency Array에 queryClient와 monthYear라는 의존성 배열을 가진 useEffect가 있음.
        - monthYear가 업데이트 될 때마다, (예를 들면 누군가가 달을 조작하는 버튼을 눌러서 2월이나 3월로 넘어갈 경우)
        - updateMonthYear가 호출되면, 현재 monthYear 값과 한 달이라는 증가감소를 기반으로, nextMonthYear를 얻게되고, 쿼리를 프리페칭하게 됨.
        - 쿼리 키는 이 의존성 배열이 되며, appointments, year, month로 식별되게 됨.
        - 서버 호출, 즉 쿼리함수는 미래의 월과 연도가 포함된 getAppointments임
      - 즉, 이 프리페치의 효과는 이 데이터로 캐시를 채워서, 사용자가 다음 달을 클릭할 때 표시되게 하는 것


      추가로 달력의 달이 2월일 경우, 3월을 미리 prefetching 해오는데, 이때, 로딩 인디케이터가 계속 켜져있고, 데이터가 모두 stale(만료) 상태이므로
      정확한 데이터라고 볼 수 없을 것(즉 최신 데이터라고 볼 수 없음) → 가장 최신의 데이터가 있는지 서버를 계속 확인하면서(isFetching) 사용자에게 빈 달력 대신, 프리페칭된 데이터를 보여줌.
      
  */

  // Notes:
  //    1. appointments is an AppointmentDateMap (object with days of month
  //       as properties, and arrays of appointments for that day as values)
  //
  //    2. The getAppointments query function needs monthYear.year and
  //       monthYear.month
  const fallback = {};

  const { data: appointments = fallback } = useQuery(
    [queryKeys.appointments, monthYear.year, monthYear.month],
    () => getAppointments(monthYear.year, monthYear.month),
    {
      select: showAll ? undefined : selectFn,
      ...commonOptions,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,

      /*
      select 함수는 showAll 상태가 참일 경우에는, selectFn 함수를 호출하지 않고, 모든 데이터를 반환함.
      showAll state가 false 일 경우에는, selectFn 함수를 실행 함.

      select 함수는 원래 반환되었을 data를 가져와서, 변환한 다음 변환한 데이터를 반환함.
      따라서, selectFn에 data가 들어가고, getAvailableAppointments를 실행함, 가능한 예약은 모두 반환하는 암시적 반환을 사용.
      (selectFn 함수 내에서 이어서 작성)

      */

      /*

      queryClient에 default 설정으로 리페칭을 제한시켜줬음.
        staleTime: 600000, // 10 minutes
        cacheTime: 900000, // 15 minutes
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,

      
      하지만 appointments 쿼리는 예약시스템이기 때문에 실시간 데이터가 굉장히 중요,
      그래서 위와 같이 설정값을 오버라이드 해주었음.
      그리고, 여기 있는 리페칭은 프리페칭에 적용되지는 않지만, staleTime과 cacheTime은 적용됨!

      그래서 다음과 같이 commonOptions로 객체로 만들어주려고 함.
      const commonOptions = {
        staleTime: 0,
        cacheTime: 300000, // 5 minutes
      };
      그리고 이 commonOptions는 prefetchQuery에 넣어주도록 함.
      useQuery 내에서 commonOptions를 스프레드 복사 해줬음. // ...commonOptions,

      */
    },

    /*
    {
      keepPreviousData: true,
    },

      keepPreviousData를 true로 설정하면, 쿼리 키가 변경될 때까지, 이전 모든 데이터가 그대로 유지 됨.

      다음 쿼리 키에 대한 데이터를 로드하는 동안, 자리 표시자(mocking)로 사용하는 것. 

      pageNation 할 때 동일하게 적용했었는데, 그 때 단점은, 새 페이지 데이터가 준비될 때까지, 이전 페이지를 계속 봐야 한다는 것이었음.

      하지만 여기서는 keepPreviousData는 적합하지 않음, 왜냐하면 달을 이동시킬 때마다 loading이 걸리고, 이전 달과, 이후 달이 겹치는 현상이 생김.
    */

    /*
      
      다음 페이지의 예약을 프리페칭 해 사용자가 월을 앞당길 때까지 기다리지 않아도 되게 하는 것.
        1. 다음달 프리페칭을 구현해보자.
        2. QueryClient 메서드를 사용
        3. useAppointments 훅 내의 useEffect 호출에서 프리페치를 구현하는 것이 좋음.
        4. prefetch 인수에 주의하기, getAppointments에 대한 인수와 쿼리키는, 현재의 monthYear가 아니라 다음 MonthYear와 관계가 있음.

    */
  );

  /** ****************** END 3: useQuery  ******************************* */

  return { appointments, monthYear, updateMonthYear, showAll, setShowAll };
}

/*

  monthYear를 업데이트할 때, 새 데이터가 로드되지 않은 이뉴는 무엇일까?
    - 모든 쿼리에 동일한 키를 사용하기 때문.
      - 모든 쿼리는 이 queryKeys.Appointments를 사용함.
    - 따라서 이전 달이나 다음 달로 이동하기 위해 화살표를 클릭하면,
      쿼리 데이터는 만료(stale) 상태이지만, 리페치(Refetch)를 트리거할 대상이 없음.
      - 리페치를 트리거하려면 컴포넌트를 다시 마운트하거나, 
      - 창을 다시 포커스 할 수도 있고,
      - 리페치 함수를 수동으로 실행할 수도 있음.
      - 또는, 자동 리페치를 수행할 수도 있음.
        - Appointments에서도 일정 시간이 지난 후에 리페치 되도록 할 예정
      - 예약이 새로 잡혔는지 확인하기 위해, 서버를 확인하는 것

    - react-query는 위와 같은 이유로 알려진 키에 대해서만 새 데이터를 가져옴
      - 알 수 없는 새로운 키가 있는 경우, 이러한 트리거가 필요하지 않음
        - 리페치가 아니라 초기 페치이기 때문.
      - 따라서, 해결책은 매월 새로운 키를 갖는 것.
      - 전에도 언급했었지만, 항상 키를 의존성 배열로 취급해야 함, 데이터가 변경될 경우 키도 변경되도록 해야함.
      - 새 쿼리를 만들고, 새 데이터를 가져오기 위함.

*/

/*

  그럼 왜 prefetchQuery에는 useCallback을 사용하지 않는 것일까?
    - select는 prefetch의 옵션이 아니므로 prefetch된 데이터에 추가할 수 없음.

*/
