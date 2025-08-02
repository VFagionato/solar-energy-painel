import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { apiService } from '../services/api';
import type { Sensor, CreateSensorDto, UpdateSensorDto, SearchSensorDto } from '../types';

export const useSensors = () => {
  return useQuery({
    queryKey: ['sensors'],
    queryFn: () => apiService.getSensors(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSensor = (uuid: string) => {
  return useQuery({
    queryKey: ['sensors', uuid],
    queryFn: () => apiService.getSensor(uuid),
    enabled: !!uuid,
  });
};

export const useSensorByCode = (code: string) => {
  return useQuery({
    queryKey: ['sensors', 'code', code],
    queryFn: () => apiService.getSensorByCode(code),
    enabled: !!code,
  });
};

export const useCreateSensor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSensorDto) => apiService.createSensor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensors'] });
      message.success('Sensor created successfully');
    },
    onError: (error: Error) => {
      message.error(`Failed to create sensor: ${error.message}`);
    },
  });
};

export const useUpdateSensor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdateSensorDto }) => 
      apiService.updateSensor(uuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sensors'] });
      queryClient.invalidateQueries({ queryKey: ['sensors', variables.uuid] });
      message.success('Sensor updated successfully');
    },
    onError: (error: Error) => {
      message.error(`Failed to update sensor: ${error.message}`);
    },
  });
};

export const useDeleteSensor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (uuid: string) => apiService.deleteSensor(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensors'] });
      message.success('Sensor deleted successfully');
    },
    onError: (error: Error) => {
      message.error(`Failed to delete sensor: ${error.message}`);
    },
  });
};

export const useIncrementSensorEvents = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (uuid: string) => apiService.incrementSensorEvents(uuid),
    onSuccess: (_, uuid) => {
      queryClient.invalidateQueries({ queryKey: ['sensors'] });
      queryClient.invalidateQueries({ queryKey: ['sensors', uuid] });
    },
  });
};

export const useIncrementSensorShutdowns = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (uuid: string) => apiService.incrementSensorShutdowns(uuid),
    onSuccess: (_, uuid) => {
      queryClient.invalidateQueries({ queryKey: ['sensors'] });
      queryClient.invalidateQueries({ queryKey: ['sensors', uuid] });
    },
  });
};

export const useSearchSensors = () => {
  return useMutation({
    mutationFn: (data: SearchSensorDto) => apiService.searchSensors(data),
  });
};