import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { apiService } from '../services/api';
import type { Event, CreateEventDto, UpdateEventDto, SearchEventDto, SensorStats } from '../types';

export const useEvents = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['events', { startDate, endDate }],
    queryFn: () => apiService.getEvents(startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes - increased to reduce re-fetching
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  });
};

export const useEvent = (uuid: string) => {
  return useQuery({
    queryKey: ['events', uuid],
    queryFn: () => apiService.getEvent(uuid),
    enabled: !!uuid,
  });
};

export const useEventsBySensor = (sensorUuid: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['events', 'sensor', sensorUuid, { startDate, endDate }],
    queryFn: () => apiService.getEventsBySensor(sensorUuid, startDate, endDate),
    enabled: !!sensorUuid,
    staleTime: 2 * 60 * 1000,
  });
};

export const useSensorStats = (sensorUuid: string) => {
  return useQuery({
    queryKey: ['sensor-stats', sensorUuid],
    queryFn: () => apiService.getSensorStats(sensorUuid),
    enabled: !!sensorUuid,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateEventDto) => apiService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['sensor-stats'] });
      message.success('Event created successfully');
    },
    onError: (error: Error) => {
      message.error(`Failed to create event: ${error.message}`);
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdateEventDto }) => 
      apiService.updateEvent(uuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.uuid] });
      queryClient.invalidateQueries({ queryKey: ['sensor-stats'] });
      message.success('Event updated successfully');
    },
    onError: (error: Error) => {
      message.error(`Failed to update event: ${error.message}`);
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (uuid: string) => apiService.deleteEvent(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['sensor-stats'] });
      message.success('Event deleted successfully');
    },
    onError: (error: Error) => {
      message.error(`Failed to delete event: ${error.message}`);
    },
  });
};

export const useSearchEvents = () => {
  return useMutation({
    mutationFn: (data: SearchEventDto) => apiService.searchEvents(data),
  });
};