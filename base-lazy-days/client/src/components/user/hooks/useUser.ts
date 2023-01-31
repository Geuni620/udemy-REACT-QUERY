import { AxiosResponse } from 'axios';
import { useQuery, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '../../../user-storage';

async function getUser(user: User | null): Promise<User | null> {
  if (!user) return null;
  const { data }: AxiosResponse<{ user: User }> = await axiosInstance.get(
    `/user/${user.id}`,
    {
      headers: getJWTHeader(user),
    },
  );
  return data.user;
}

interface UseUser {
  user: User | null;
  updateUser: (user: User) => void;
  clearUser: () => void;
}

export function useUser(): UseUser {
  const queryClient = useQueryClient();
  const { data: user } = useQuery(queryKeys.user, () => getUser(user), {
    initialData: getStoredUser,
    /*
      60. useQuery를 위한 localStorage의 initialData
        
      - 페이지를 새로 고침할 때와 같이 useQuery가 초기화를 실행할 때 이 데이터가 로컬 스토리지에 정의되어 있는지 확인하는 것입니다
      - 이를 위해 useQuery에서 initialData 옵션을 사용합니다
      - initialData는 초기 데이터를 캐시에 추가하고 싶을 때 사용합니다
      - 과거의 쿼리를 떠올려보죠, 페이지에서 오류가 발생하지 않게 하려면 초기 값이 필요한 때도 있었습니다
        - 예를 들어, useTreatments나 useStaff에서 배열을 반복하는 경우, 구조 분해의 기본값으로 빈 배열을 넣을 것입니다
        - 다음은 자리 표시자 데이터가 필요할 때입니다
        - placeholderData 옵션을 사용해도 되긴 하지만요
          - 두 경우 모두 캐시에 추가되지 않습니다, 
          - 하지만 사용자의 경우 캐시에 추가하고자 하는 실제 사용자 데이터가 있으며 이는 로컬 스토리지에서 가져옵니다
        - React Query는 쿼리 캐시 데이터를 브라우저에 유지하는 플러그인을 제공합니다
          - 본 강의 녹화 시점에서는 모두 실험 단계에 있으므로
          - 로컬 스토리지를 통해 데이터 보존을 설명하겠습니다
    */
    onSuccess: (received: User | null) => {
      if (!received) {
        // 사용자 스토리지에 있던 사용자 정보를 지우겠다는 뜻
        clearStoredUser();
      } else {
        // 해당 값으로 로컬 스토리지를 설정할 거임.
        setStoredUser(received);
      }

      /*
      - onSuccess는 쿼리 함수(useQuery)나 setQueryData(queryClient.setQueryData)에서 데이터를 가져오는 함수입니다, 중요한건 둘 다에서 실행되기 때문입니다
      */
    },
  });

  /*
    기존 user의 값을 이용해서 user의 값을 업데이트하는 것
      - 쿼리함수는 getUser 함수로 선언할 것이고, 인자로 넘길 값은 기존 user 값임.
      - 이렇게 받은 값은 user의 값을 업데이트하는데 사용함(getUser로 user넘기고 다시 받은 user로 user를 업데이트함)
  */

  /*
    58. React Query와 Auth 통합하기 
    지난 강의에서는 useUser 훅에서 userQuery를 추가하여 기존 user(사용자) 값을 사용하여 서버에서 데이터를 가져오도록 했음.
    - 어떤 사용자의 데이터를 원하는지 알려주기 위해 user.id를 보내야 하므로 user 값을 알아야함.
    - 하지만 애초에 user가 정의되지 않는다는 문제가 있었음.
      - 항상 거짓(falsy)의 값이 나오고, 사용자는 null을 반환할 것, 즉 어떤 데이터도 얻지 못한다는 뜻.
      - 이때 updateUser 함수와 clearUser 함수가 필요함.
        - useAuth 훅으로 쿼리 캐시에 값을 설정할 수 있으면 좋을 거 같음, 그래야 useQuery 함수를 실행할 때 사용할 값이 생기기 때문.
        - 위에서 user(사용자)의 데이터를 가져오는 것임.
          - 데이터 값의 출저, 즉 이 키(queryKeys.user)의 캐시 값

    - React Query는 인증 제공자 역할을 하며 React Query의 캐시는 user 값을 필요로 하는 모든 컴포넌트에 user 값을 제공해줌(store)
    - 쿼리 캐시에 값을 설정하기 위해 queryClient.setQueryData를 사용하려고 함, 쿼리 키와 값을 가져와 쿼리 캐시에 해당 키에 대한 값을 설정할 수 있음
    - 쿼리 함수의 작동 방식과 유사하지만 여기서는 쿼리 함수 없이 직접 설정하는 거임.
  */

  /*
  - useUser 훅에 있는 updateUser와 clearUser에 setQueryData 호출을 추가할 거임.
  - useAuth는 이미 이러한 함수들을 호출하도록 작성되었음.



 */

  // meant to be called from useAuth

  function updateUser(newUser: User): void {
    queryClient.setQueryData(queryKeys.user, newUser);
  }

  // meant to be called from useAuth
  function clearUser() {
    queryClient.setQueryData(queryKeys.user, null);
  }

  return { user, updateUser, clearUser };
  /*
    57.useAuth, useUser와 userQuery
      - useUser에는 사용자 데이터와 사용자 정보를 업데이트하는 함수가 있음
      - updateUser는 사용자 로그인이나, 사용자 정보 업데이트를 처리하고, clearUser는 로그아웃을 처리함
      - useUser의 책임은 로컬 스토리지와 쿼리 캐시에서 사용자의 상태를 유지하는 것
  */
}

/*
    59. localStorage에서 사용자 데이터 유지하기
      - 로그인과 로그아웃은 가능하지만 로그인한 다음 페이지를 새로 고침하면 로그인이 유지되지 않습니다
      - 이를 해결하는 방법은 user(사용자) 데이터를 로컬 스토리지에 저장하고 useUser의 useQuery가 초기 실행될 때 해당 로컬 스토리지를 초기 데이터로 사용하는 것입니다
      - useUser의 역할에 관한 슬라이드로 돌아가서 로컬 스토리지와 관련한 두 가지 책임을 상기해봅시다
        1. 첫 번째 역할은 초기 실행 시 로컬 스토리지에서 로드하여 페이지를 새로 고침해도 React Query가 사용자를 잃지 않도록 하는 것입니다
      - 하지만 애초에 로컬 스토리지가 사용자 데이터로 채워져 있어야 로컬 스토리지에서 로드하는 것이 가능하므로 useQuery의 onSuccess 콜백으로 로컬 스토리지를 업데이트해야 합니다

      - 기억하시겠지만, onSuccess 콜백은 useAuth 함수 작업 시 사용하는 queryClient.setQueryData 실행 이후나 쿼리 함수가 반환된 후에 실행됩니다
      - 여기에서 로컬 스토리지를 업데이트하면 둘 중 한 방법으로 캐시도 업데이트하고 로컬 스토리지도 업데이트할 수 있습니다
*/

/*
    60. useQuery를 위한 localStorage의 initialData
      - initialData는 초기 데이터를 캐시에 추가하고 싶을 때 사용합니다


*/
