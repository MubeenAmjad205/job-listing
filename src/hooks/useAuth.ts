// hooks/useAuth.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { User } from '@/types';

export interface AuthData {
  user: User | null;
  isLoggedIn: boolean;
}

const fetchAuth = async (): Promise<AuthData> => {
  const response = await axios.get('/api/auth/session');
  return response.data;
};

export const useAuth = () => {
  return useQuery<AuthData>({
    queryKey: ['auth'],
    queryFn: fetchAuth,
    staleTime: 0, // Immediate updates after mutations
    retry: false
  });
};