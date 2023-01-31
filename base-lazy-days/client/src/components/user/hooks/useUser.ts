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
  const { data: user } = useQuery(queryKeys.user, () => getUser(user));

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
