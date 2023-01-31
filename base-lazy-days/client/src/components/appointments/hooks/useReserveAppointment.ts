import { UseMutateFunction, useMutation } from 'react-query';

import { Appointment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from '../../user/hooks/useUser';

// for when we need functions for useMutation
async function setAppointmentUser(
  appointment: Appointment,
  userId: number | undefined,
): Promise<void> {
  if (!userId) return;
  const patchOp = appointment.userId ? 'replace' : 'add';
  const patchData = [{ op: patchOp, path: '/userId', value: userId }];
  await axiosInstance.patch(`/appointment/${appointment.id}`, {
    data: patchData,
  });
}

export function useReserveAppointment(): UseMutateFunction<
  void,
  unknown,
  Appointment,
  unknown
> {
  const { user } = useUser();
  const toast = useCustomToast();

  const { mutate } = useMutation((appointment: Appointment) =>
    setAppointmentUser(appointment, user?.id),
  );
  /*
    - useMutation에는 쿼리 키가 필요하지 않음, 다시 말하지만, 캐시에 있는 쿼리와는 관련이 없음.
    - 변이 함수를 넘겨주고(setAppointmentsUser), 인자값으로 appointment와 userId가 모두 필요함.
      - 서버의 데이터베이스를 업데이트하려면 어떤 사용자가 어떤 예약을 했는지 알아야 함.
        - setAppointment를 실행시켜주고, appointment를 넘겨주어야하는데, 이때 mutate 함수에 인수를 추가할 수 있음.
        - 즉, useMutation은 인수를 변이 함수 내에 appointment(매개변수)로 받을 수 있음.
          const { mutate } = useMutation((appointment) =>
                setAppointmentUser(appointment, user?.id),
          );
        - mutate를 호출할 때 appointment를 주고 setAppointment를 실행할 때 appointment와 userId를 넘겨줌.
  */

  return mutate;

  /*
    66. mutate 함수를 위한 typeScript
      - custom hook에서 mutate 함수를 반환하는 유형은 다음과 같음.
        - useMutateFunction에는 몇 가지 매개변수가 있는데, 
          1. 변이 함수 자체에서 반환된 데이터(Date) 유형: 이 경우 변이 함수는 데이터를 반환하지 않음, 따라서 void로 설정.
          2. 발생할 것으로 예상되는 오류 유형 : 이것은 Error로 설정.
          3. 변수(Variables) : 이것은 mutate 함수가 예상하는 변수 유형임.
            - 위 경우 mutate 함수에 Appointment를 전달하죠. 
          4. 컨텍스트(Context) : 이것은 낙관적 업데이트 롤백을 위해, onMutate에 설정하는 유형임.
            - 추후 Optimistic(낙관적) 업데이트 강의에서 또 살펴봄
            - 컨텍스트에 대한 Appointment 유형을 저장할 것이기 때문에 지금 추가했음.

      - 이제 위 내용에서 본 유형을 반환해보자
      export function useReserveAppointment(): UseMutateFunction<> {
        const { user } = useUser();
        const toast = useCustomToast();

        const { mutate } = useMutation((appointment) =>
          setAppointmentUser(appointment, user?.id),
        );
      - useMutateFunction<>를 입력해야함, 이 type은 react-query에서 가져와야함.
        - 1. 위에서 봤듯이 변이 함수에서 반환된 데이터의 경우 void임.
        - 2. 오류 유형은 unknown 상태로 두겠음. 이전에 봤듯이 오류 유형과 onError 핸들러를 확인했었음.
        - 3. 다음은 mutate 함수에서 이 mutation 함수로 전달될 변수임, 따라서 Appointment 유형이 됨.
        - 4. 그런 다음 마지막으로 컨텍스트 유형이 있음, 이 유형은 unknown으로 남겨두었다가 낙관적 업데이트를 할 때 내용을 채워 넣겠음.
      
      - 이렇게 했을 때 여전히, 에러가 존재하는데 appointment 매개변수에 빨간 줄이 뜸 → 인수 Type을 구체적으로 입력해 주면 해결가능.
  */
}

/*
    - 이것은 AppointmentMutationFunction을 반환하는데, 이를 통해 캘린더가 Appointment(에약)로 MutationFunction을 실행하고, 사용자가 예약을 할 수 있도록 Appointment를 업데이트 할 수 있음.
      - 지금은 AppointmentMutationFunction type 내 appointment(자리표시자) 유형이 있는데, appointment를 가지고 가서 void를 반환하는 함수임
      - 하지만, useQuery에서 실제 mutate 함수를 반환해서
        return (appointment: Appointment) => {

        }
        이 부분을 업데이트 할 거임.

    
    - useMutation을 사용해 예약을 진행하려는 이유는, 서버에서 데이터를 변경할 것이기 때문임.
    - useMutation은 useQuery와 매우 유사한데, 몇 가지 차이점이 존재함.
      - useMutation은 일회성이기 때문에 캐시 데이터가 존재하지 않음.
        - 페칭이나 리페칭 그리고 업데이트 할 데이터가 있는 useQuery와는 다름.

      - 기본적으로 재시도(retry)가 없음.
        - useQuery는 기본적으로 세 번 재시도 함
      - 관련된 데이터가 없으므로, 리페치도 없음.

      - 또한 캐시 데이터가 없으므로, isLoading과 isFetching이 구분되지 않음.
        - isLoading은 데이터가 없을 때 이루어지는 페칭이기 때문.
        - useMutation에는 캐시 데이터 개념이 없으므로, isLoading 개념도 없음, isFetching만 있음

      - useMutation은 반환 객체에서, mutate 함수를 반환함, 그리고 이것이 변이를 실행하는데 사용됨.
      - onMutate 콜백도 있음, 이것은 낙관적 쿼리(optimistic query)에 사용할 거임, 변이가 실패할 때 복원할 수 있도록 이전 상태를 저장하는 데 사용할 것.

  */
