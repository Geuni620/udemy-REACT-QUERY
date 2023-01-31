import { Spinner, Text } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useIsFetching, useIsMutating } from 'react-query';

export function Loading(): ReactElement {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  /*
    이렇게하면 현재 해결되지 않은 변이 함수의 개수를 정수로 볼 수 있음.
  */

  const display = isFetching || isMutating ? 'inherit' : 'none';

  return (
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="olive.200"
      color="olive.800"
      role="status"
      position="fixed"
      zIndex="9999"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      display={display}
    >
      <Text display="none">Loading...</Text>
    </Spinner>
  );
}

/*
  
  useIsFetching은 현재 가져오기 상태인 쿼리 호출의 수를 나타내는 정수값을 반환함.
  - isFetching이 0보다 크다면, 가져오기 상태인 호출이 존재하며, 참으로 평가될 것
    const display = isFetching ? 'inherit' : 'none';
    - 이 경우 display는 inherit으로 설정되어 로딩 스피너를 표시하게 됨
  - 현재 가져오는 항목이 없다면, isFetching은 거짓으로 평가되는데 0이 거짓이기 때문.

  - 윈도우(dev tools)를 클릭만 했는데 왜 로딩이 진행될까?
    - 이건 React-query와 기본으로 함께 따라오는 리페칭 구성으로, 윈도우에 다시 돌아올 때 데이터를 다시 가져오게 됨.
  - 

*/
