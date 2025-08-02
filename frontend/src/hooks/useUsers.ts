import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { apiService } from '../services/api';
import type { User, CreateUserDto, UpdateUserDto, SearchUserDto } from '../types';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiService.getUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUser = (uuid: string) => {
  return useQuery({
    queryKey: ['users', uuid],
    queryFn: () => apiService.getUser(uuid),
    enabled: !!uuid,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateUserDto) => apiService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('User created successfully');
    },
    onError: (error: Error) => {
      message.error(`Failed to create user: ${error.message}`);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdateUserDto }) => 
      apiService.updateUser(uuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.uuid] });
      message.success('User updated successfully');
    },
    onError: (error: Error) => {
      message.error(`Failed to update user: ${error.message}`);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (uuid: string) => apiService.deleteUser(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('User deleted successfully');
    },
    onError: (error: Error) => {
      message.error(`Failed to delete user: ${error.message}`);
    },
  });
};

export const useSearchUsers = () => {
  return useMutation({
    mutationFn: (data: SearchUserDto) => apiService.searchUsers(data),
  });
};