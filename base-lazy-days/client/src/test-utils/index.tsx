import { render, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

// make a function to generate a unique query client for each test
const generateQueryClient = () => {
  return new QueryClient();
};

export function renderWithQueryClient(
  ui: ReactElement,
  client?: QueryClient,
): RenderResult {
  const queryClient = client ?? generateQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

// import { defaultQueryClientOptions } from '../react-query/queryClient';

// from https://tkdodo.eu/blog/testing-react-query#for-custom-hooks
// export const createQueryClientWrapper = (): React.FC => {
//   const queryClient = generateQueryClient();
//   return ({ children }) => (
//     <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
//   );
// };
