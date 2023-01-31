import { Box, HStack, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { ReactElement } from 'react';

import { Appointment as AppointmentType, User } from '../../../../shared/types';
import { useUser } from '../user/hooks/useUser';
import { useReserveAppointment } from './hooks/useReserveAppointment';
import { appointmentInPast, getAppointmentColor } from './utils';

// determine whether this appointment can be reserved / un-reserved by logged-in user
function isClickable(
  user: User | null,
  appointmentData: AppointmentType,
): boolean {
  return !!(
    user?.id &&
    (!appointmentData.userId || appointmentData.userId === user?.id) &&
    !appointmentInPast(appointmentData)
  );
}

interface AppointmentProps {
  appointmentData: AppointmentType;
}

export function Appointment({
  appointmentData,
}: AppointmentProps): ReactElement {
  const { user } = useUser();
  const reserveAppointment = useReserveAppointment();
  const [textColor, bgColor] = getAppointmentColor(appointmentData, user?.id);

  const clickable = isClickable(user, appointmentData);
  let onAppointmentClick: undefined | (() => void);
  let hoverCss = {};

  // turn the lozenge into a button if it's clickable
  if (clickable) {
    onAppointmentClick = user
      ? () => reserveAppointment(appointmentData)
      : undefined;
    hoverCss = {
      transform: 'translateY(-1px)',
      boxShadow: 'md',
      cursor: 'pointer',
    };
  }

  const appointmentHour = dayjs(appointmentData.dateTime).format('h a');
  return (
    <Box
      borderRadius="lg"
      px={2}
      bgColor={bgColor}
      color={textColor}
      as={clickable ? 'button' : 'div'}
      onClick={onAppointmentClick}
      _hover={hoverCss}
    >
      <HStack justify="space-between">
        <Text as="span" fontSize="xs">
          {appointmentHour}
        </Text>
        <Text as="span" fontSize="xs">
          {appointmentData.treatmentName}
        </Text>
      </HStack>
    </Box>
  );
}

/*
  67. 변이 후의 쿼리 무효화하기
    - 앱은 이미 설정되어 있어서 useReserveAppointment를 이미 Appointment 컴포넌트의 onAppointmentClick에 사용 중임.
      - 캘린더에 타원형으로 예약을 표시해 주는 것이 바로 이것.

    - 이렇게 reserveAppointment 훅이 사용되었고, 이것이 이제 mutate 함수가 되고, onAppointmentClick에서 appointment가 가지고 있는 데이터로 예약을 할 수 있음

    - 해당 appointmentData는 useReserveAppointment 훅에서 mutation(useMutation) 함수에 전달되고, setAppointmentUser를 실행하여 서버를 업데이트 함.

    - 하지만 실제로 앱에서 진행해보면(auth를 듣지 않은 상태), 클릭 후 추가 반응이 없음.
    - 즉, 변이 후에 데이터를 다시 가져와야하는데, 새로고침 이후에 데이터를 업데이트 함.
      - 관련 쿼리를 무효화하여 데이터가 최신이 아님을 React-query에 알려주어야 함.
    
    - queryClient에는 invalidateQueries 메서드가 있음.
      - 예약시 appointment를 변경할 때, appointment 데이터에 대한 캐시를 무효화하는 데 이것을 사용할 거임.
      - 사용자가 페이지를 새로고침 할 필요가 없도록 하기 위한 것.

    - invalidateQueries의 효과는 다음과 같음.
      - 쿼리를 만료(stale)로 표시하고, 
      - 쿼리가 현재 렌더링 중이면 리페치(Refetch)를 트리거 함.
        - 쿼리를 사용하는 컴포넌트가 표시되는 경우임
      
      - 일반적으로 mutate를 호출하면, 변이에 있는 onSuccess 핸들러가 관련 쿼리를 무효화하고, 이에 따라 데이터 리페치가 트리거 됨.
      - 이에 따라 데이터 리페치가 트리거 됨, 사용자가 페이지를 새로고침 할 필요 없도록, 데이터를 업데이트 하는 것.
*/
