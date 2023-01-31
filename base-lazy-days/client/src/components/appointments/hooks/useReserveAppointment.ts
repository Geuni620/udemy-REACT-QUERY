import { useMutation } from 'react-query';

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

// TODO: update type for React Query mutate function
type AppointmentMutationFunction = (appointment: Appointment) => void;

export function useReserveAppointment(): AppointmentMutationFunction {
  const { user } = useUser();
  const toast = useCustomToast();

  const { mutate } = useMutation((appointment) =>
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
