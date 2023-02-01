import { UseMutateFunction, useMutation, useQueryClient } from 'react-query';

import { Appointment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';

// for when server call is needed
async function removeAppointmentUser(appointment: Appointment): Promise<void> {
  const patchData = [{ op: 'remove', path: '/userId' }];
  await axiosInstance.patch(`/appointment/${appointment.id}`, {
    data: patchData,
  });
}

export function useCancelAppointment(): UseMutateFunction<
  void,
  unknown,
  Appointment,
  unknown
> {
  const queryClient = useQueryClient();
  const toast = useCustomToast();

  const { mutate } = useMutation(
    (appointments: Appointment) => removeAppointmentUser(appointments),
    /*
      사실 이 부분은 이렇게도 수정할 수 있음
      const {mutate} = useMutation(removeAppointmentUser)


      그리고 UseMutateFunction<void, unknown, Appointment, unknown> 중 마지막 unknown은 context부분임, 여기가 unknown인 이유는 onMutate 함수를 실행하지 않았기 때문.
      - 이 부분은 낙관적 업데이트에 대해 이야기 할 때 더 자세히 다룰 예정.
    */
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.appointments]);
        toast({
          title: 'You have canceled the appointment!',
          status: 'warning',
        });
      },
    },
  );

  return mutate;
}
