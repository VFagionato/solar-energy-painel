// User types
export interface User {
  uuid: string;
  name: string;
  last_name: string;
  document: string;
  address_uuid?: string;
  created_at: string;
  updated_at: string;
  address?: Address;
  sensors?: Sensor[];
}

export interface CreateUserDto {
  name: string;
  last_name: string;
  document: string;
  address_uuid?: string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}

export interface SearchUserDto {
  name?: string;
  last_name?: string;
  document?: string;
  address_uuid?: string;
  search?: string;
}

// Address types
export interface Address {
  uuid: string;
  user_uuid?: string;
  sensor_uuid?: string;
  street: string;
  number: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  created_at: string;
  updated_at: string;
  user?: User;
  sensors?: Sensor[];
}

export interface CreateAddressDto {
  user_uuid?: string;
  sensor_uuid?: string;
  street: string;
  number: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
}

export interface UpdateAddressDto extends Partial<CreateAddressDto> {}

export interface SearchAddressDto {
  user_uuid?: string;
  sensor_uuid?: string;
  street?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  search?: string;
}

// Sensor types
export interface Sensor {
  uuid: string;
  code: string;
  equip_address_uuid: string;
  total_events: number;
  angle: number;
  power_generate: number;
  last_shutdown?: string;
  total_shutdown: number;
  created_at: string;
  updated_at: string;
  user?: User;
  location?: Address;
  events?: Event[];
}

export interface CreateSensorDto {
  code: string;
  equip_address_uuid: string;
  total_events?: number;
  angle: number;
  power_generate: number;
  last_shutdown?: string;
  total_shutdown?: number;
}

export interface UpdateSensorDto extends Partial<CreateSensorDto> {}

export interface SearchSensorDto {
  code?: string;
  equip_address_uuid?: string;
  min_total_events?: number;
  max_total_events?: number;
  min_angle?: number;
  max_angle?: number;
  min_power_generate?: number;
  max_power_generate?: number;
  search?: string;
}

// Event types
export interface Event {
  uuid: string;
  sensor_uuid: string;
  power_generated: number;
  timestamp: string;
  heat: number;
  created_at: string;
  updated_at: string;
  sensor?: Sensor;
}

export interface CreateEventDto {
  sensor_uuid: string;
  power_generated: number;
  timestamp: string;
  heat: number;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}

export interface SearchEventDto {
  sensor_uuid?: string;
  min_power_generated?: number;
  max_power_generated?: number;
  start_date?: string;
  end_date?: string;
  min_heat?: number;
  max_heat?: number;
}

// Statistics types
export interface SensorStats {
  totalEvents: number;
  totalPowerGenerated: number;
  averagePowerGenerated: number;
  averageHeat: number;
  lastEvent: string | null;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  power: number;
  heat: number;
  sensor: string;
  user: string;
}

export interface AggregatedData {
  sensorCode: string;
  userName: string;
  totalPower: number;
  totalEvents: number;
  averageHeat: number;
  lastActivity: string;
}