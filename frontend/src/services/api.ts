import config from '../config/env';
import type {
  User, CreateUserDto, UpdateUserDto, SearchUserDto,
  Address, CreateAddressDto, UpdateAddressDto, SearchAddressDto,
  Sensor, CreateSensorDto, UpdateSensorDto, SearchSensorDto,
  Event, CreateEventDto, UpdateEventDto, SearchEventDto,
  SensorStats
} from '../types';

class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      
      throw new Error('An unknown error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; timestamp: string; service: string }> {
    return this.get('/health');
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    return this.get<User[]>('/users');
  }

  async getUser(uuid: string): Promise<User> {
    return this.get<User>(`/users/${uuid}`);
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return this.post<User>('/users', data);
  }

  async updateUser(uuid: string, data: UpdateUserDto): Promise<User> {
    return this.patch<User>(`/users/${uuid}`, data);
  }

  async deleteUser(uuid: string): Promise<void> {
    return this.delete<void>(`/users/${uuid}`);
  }

  async searchUsers(data: SearchUserDto): Promise<User[]> {
    return this.post<User[]>('/users/search', data);
  }

  // Address endpoints
  async getAddresses(): Promise<Address[]> {
    return this.get<Address[]>('/addresses');
  }

  async getAddress(uuid: string): Promise<Address> {
    return this.get<Address>(`/addresses/${uuid}`);
  }

  async createAddress(data: CreateAddressDto): Promise<Address> {
    return this.post<Address>('/addresses', data);
  }

  async updateAddress(uuid: string, data: UpdateAddressDto): Promise<Address> {
    return this.patch<Address>(`/addresses/${uuid}`, data);
  }

  async deleteAddress(uuid: string): Promise<void> {
    return this.delete<void>(`/addresses/${uuid}`);
  }

  async searchAddresses(data: SearchAddressDto): Promise<Address[]> {
    return this.post<Address[]>('/addresses/search', data);
  }

  // Sensor endpoints
  async getSensors(): Promise<Sensor[]> {
    return this.get<Sensor[]>('/sensors');
  }

  async getSensor(uuid: string): Promise<Sensor> {
    return this.get<Sensor>(`/sensors/${uuid}`);
  }

  async getSensorByCode(code: string): Promise<Sensor> {
    return this.get<Sensor>(`/sensors/code/${code}`);
  }

  async createSensor(data: CreateSensorDto): Promise<Sensor> {
    return this.post<Sensor>('/sensors', data);
  }

  async updateSensor(uuid: string, data: UpdateSensorDto): Promise<Sensor> {
    return this.patch<Sensor>(`/sensors/${uuid}`, data);
  }

  async deleteSensor(uuid: string): Promise<void> {
    return this.delete<void>(`/sensors/${uuid}`);
  }

  async incrementSensorEvents(uuid: string): Promise<Sensor> {
    return this.post<Sensor>(`/sensors/${uuid}/increment-events`);
  }

  async incrementSensorShutdowns(uuid: string): Promise<Sensor> {
    return this.post<Sensor>(`/sensors/${uuid}/increment-shutdowns`);
  }

  async searchSensors(data: SearchSensorDto): Promise<Sensor[]> {
    return this.post<Sensor[]>('/sensors/search', data);
  }

  // Event endpoints
  async getEvents(startDate?: string, endDate?: string): Promise<Event[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.get<Event[]>(`/events${query}`);
  }

  async getEvent(uuid: string): Promise<Event> {
    return this.get<Event>(`/events/${uuid}`);
  }

  async getEventsBySensor(sensorUuid: string, startDate?: string, endDate?: string): Promise<Event[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.get<Event[]>(`/events/sensor/${sensorUuid}${query}`);
  }

  async getSensorStats(sensorUuid: string): Promise<SensorStats> {
    return this.get<SensorStats>(`/events/sensor/${sensorUuid}/stats`);
  }

  async createEvent(data: CreateEventDto): Promise<Event> {
    return this.post<Event>('/events', data);
  }

  async updateEvent(uuid: string, data: UpdateEventDto): Promise<Event> {
    return this.patch<Event>(`/events/${uuid}`, data);
  }

  async deleteEvent(uuid: string): Promise<void> {
    return this.delete<void>(`/events/${uuid}`);
  }

  async searchEvents(data: SearchEventDto): Promise<Event[]> {
    return this.post<Event[]>('/events/search', data);
  }
}

export const apiService = new ApiService();
export default apiService;