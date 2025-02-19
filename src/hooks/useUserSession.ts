import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserSession } from '@/types/index';

// Helper functions to interact with local storage
const getSession = (): UserSession | null => {
  const session = localStorage.getItem('userSession');
  return session ? JSON.parse(session) : null;
};

const setSession = (session: UserSession): void => {
  localStorage.setItem('userSession', JSON.stringify(session));
};

const clearSession = (): void => {
  localStorage.removeItem('userSession');
};

export const useUserSession = () => {
  const queryClient = useQueryClient();

  const { data: session, refetch } = useQuery<UserSession | null>({
    queryKey: ['userSession'],
    queryFn: getSession,
    staleTime: Infinity,
    initialData: getSession(),
  });

  const saveSessionFn = async (newSession: UserSession): Promise<void> => {
    setSession(newSession);
    queryClient.setQueryData(['userSession'], newSession); // Update query cache
  };

  const saveSession = useMutation<void, Error, UserSession, unknown>({
    mutationFn: saveSessionFn,
    onSuccess: () => {
      refetch(); // Refetch to ensure the latest data
    },
  });

  const removeSessionFn = async (): Promise<void> => {
    clearSession();
    queryClient.setQueryData(['userSession'], null); // Clear query cache
  };

  const removeSession = useMutation<void, Error, void, unknown>({
    mutationFn: removeSessionFn,
  });

  return { session, saveSession, removeSession };
};
