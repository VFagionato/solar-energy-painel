import React from 'react';
import { Input, AutoComplete, Card, Avatar, Typography, Spin, Row, Col, Tag } from 'antd';
import { SearchOutlined, UserOutlined, ExperimentOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
import { useSearchUsers, useSearchSensors, useSearchEvents } from '../../hooks';
import type { User, Sensor, Event } from '../../types';
import dayjs from 'dayjs';

const { Text } = Typography;

interface SearchResult {
  key: string;
  value: string;
  type: 'user' | 'sensor' | 'event';
  data: User | Sensor | Event;
}

interface GlobalSearchProps {
  onSelect?: (type: string, item: any) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onSelect,
  placeholder = "Search users, sensors, or events...",
  style,
}) => {
  const [searchText, setSearchText] = React.useState('');
  const [options, setOptions] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  const searchUsers = useSearchUsers();
  const searchSensors = useSearchSensors();
  const searchEvents = useSearchEvents();

  const performSearch = React.useCallback(async (value: string) => {
    if (!value.trim()) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const [usersResult, sensorsResult, eventsResult] = await Promise.allSettled([
        searchUsers.mutateAsync({ search: value }),
        searchSensors.mutateAsync({ search: value }),
        searchEvents.mutateAsync({ 
          start_date: dayjs().subtract(30, 'days').toISOString(),
          end_date: dayjs().toISOString(),
        }),
      ]);

      const results: SearchResult[] = [];

      // Process user results
      if (usersResult.status === 'fulfilled') {
        usersResult.value.slice(0, 3).forEach(user => {
          results.push({
            key: `user-${user.uuid}`,
            value: `${user.name} ${user.last_name}`,
            type: 'user',
            data: user,
          });
        });
      }

      // Process sensor results
      if (sensorsResult.status === 'fulfilled') {
        sensorsResult.value.slice(0, 3).forEach(sensor => {
          results.push({
            key: `sensor-${sensor.uuid}`,
            value: sensor.code,
            type: 'sensor',
            data: sensor,
          });
        });
      }

      // Process event results (filter by power/heat if search is numeric)
      if (eventsResult.status === 'fulfilled') {
        const numericValue = parseFloat(value);
        const filteredEvents = eventsResult.value.filter(event => {
          if (!isNaN(numericValue)) {
            return (Number(event.power_generated) || 0) >= numericValue || (Number(event.heat) || 0) >= numericValue;
          }
          return true;
        });

        filteredEvents.slice(0, 3).forEach(event => {
          results.push({
            key: `event-${event.uuid}`,
            value: `Power: ${event.power_generated}kW - ${dayjs(event.timestamp).format('MMM DD, HH:mm')}`,
            type: 'event',
            data: event,
          });
        });
      }

      setOptions(results);
    } catch (error) {
      console.error('Search error:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [searchUsers, searchSensors, searchEvents]);

  const debouncedSearch = React.useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => performSearch(value), 300);
    };
  }, [performSearch]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    debouncedSearch(value);
  };

  const handleSelect = (value: string) => {
    const selectedOption = options.find(option => option.key === value);
    if (selectedOption && onSelect) {
      onSelect(selectedOption.type, selectedOption.data);
    }
    setSearchText('');
    setOptions([]);
  };

  const renderOption = (option: SearchResult) => {
    const getIcon = () => {
      switch (option.type) {
        case 'user':
          return <UserOutlined style={{ color: '#1890ff' }} />;
        case 'sensor':
          return <ExperimentOutlined style={{ color: '#52c41a' }} />;
        case 'event':
          return <CalendarOutlined style={{ color: '#faad14' }} />;
        default:
          return <SearchOutlined />;
      }
    };

    const getTypeColor = () => {
      switch (option.type) {
        case 'user':
          return 'blue';
        case 'sensor':
          return 'green';
        case 'event':
          return 'orange';
        default:
          return 'default';
      }
    };

    const getDescription = () => {
      switch (option.type) {
        case 'user':
          const user = option.data as User;
          return `Document: ${user.document}`;
        case 'sensor':
          const sensor = option.data as Sensor;
          return `Power: ${sensor.power_generate}kW | Events: ${sensor.total_events}`;
        case 'event':
          const event = option.data as Event;
          return `Heat: ${event.heat}°C | ${dayjs(event.timestamp).format('YYYY-MM-DD HH:mm')}`;
        default:
          return '';
      }
    };

    return (
      <Card size="small" style={{ margin: '4px 0' }}>
        <Row align="middle" gutter={12}>
          <Col flex="none">
            <Avatar icon={getIcon()} size="small" />
          </Col>
          <Col flex="auto">
            <div>
              <Text strong>{option.value}</Text>
              <Tag color={getTypeColor()} style={{ marginLeft: 8, fontSize: '10px' }}>
                {option.type.toUpperCase()}
              </Tag>
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {getDescription()}
            </Text>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <AutoComplete
      style={{ width: '100%', ...style }}
      value={searchText}
      options={options.map(option => ({
        key: option.key,
        value: option.key,
        label: renderOption(option),
      }))}
      onSelect={handleSelect}
      onSearch={handleSearch}
      placeholder={placeholder}
      notFoundContent={loading ? <Spin size="small" /> : null}
      allowClear
    >
      <Input
        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        suffix={loading ? <Spin size="small" /> : null}
        size="large"
      />
    </AutoComplete>
  );
};

export default GlobalSearch;