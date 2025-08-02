import React from 'react';
import { Card, Spin, Alert, Select, DatePicker, Row, Col } from 'antd';
import { Line, Column } from '@ant-design/charts';
import { useEvents, useSensors, useUsers } from '../../hooks';
import type { ChartDataPoint } from '../../types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface EventsAggregationChartProps {
  chartType?: 'line' | 'column';
  showFilters?: boolean;
}

const EventsAggregationChart: React.FC<EventsAggregationChartProps> = ({
  chartType = 'line',
  showFilters = true,
}) => {
  const [selectedUser, setSelectedUser] = React.useState<string | undefined>();
  const [selectedSensor, setSelectedSensor] = React.useState<string | undefined>();
  const [dateRange, setDateRange] = React.useState<[string, string] | undefined>();

  const { data: events, isLoading: eventsLoading, error: eventsError } = useEvents(
    dateRange?.[0],
    dateRange?.[1]
  );
  const { data: sensors, isLoading: sensorsLoading } = useSensors();
  const { data: users, isLoading: usersLoading } = useUsers();

  const isLoading = eventsLoading || sensorsLoading || usersLoading;

  // Process data for charts
  const chartData = React.useMemo(() => {
    if (!events || !sensors || !users) return [];

    const filteredEvents = events.filter(event => {
      const sensor = sensors.find(s => s.uuid === event.sensor_uuid);
      if (!sensor) return false;

      if (selectedUser && sensor.user?.uuid !== selectedUser) return false;
      if (selectedSensor && sensor.uuid !== selectedSensor) return false;

      return true;
    });

    const dataPoints: ChartDataPoint[] = filteredEvents.map(event => {
      const sensor = sensors.find(s => s.uuid === event.sensor_uuid);
      const user = sensor?.user || users.find(u => u.uuid === sensor?.user?.uuid);

      return {
        date: dayjs(event.timestamp).format('YYYY-MM-DD HH:mm'),
        power: event.power_generated,
        heat: event.heat,
        sensor: sensor?.code || 'Unknown',
        user: user ? `${user.name} ${user.last_name}` : 'Unknown',
      };
    });

    return dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, sensors, users, selectedUser, selectedSensor]);

  // Aggregate data by sensor and user
  const aggregatedData = React.useMemo(() => {
    if (!chartData.length) return [];

    const grouped = chartData.reduce((acc, item) => {
      const key = `${item.sensor}-${item.user}`;
      if (!acc[key]) {
        acc[key] = {
          sensorCode: item.sensor,
          userName: item.user,
          totalPower: 0,
          totalEvents: 0,
          totalHeat: 0,
        };
      }
      acc[key].totalPower += item.power;
      acc[key].totalEvents += 1;
      acc[key].totalHeat += item.heat;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      ...item,
      averageHeat: item.totalHeat / item.totalEvents,
      category: `${item.sensorCode} (${item.userName})`,
    }));
  }, [chartData]);

  const lineConfig = {
    data: chartData,
    xField: 'date',
    yField: 'power',
    seriesField: 'sensor',
    smooth: true,
    point: {
      size: 3,
      shape: 'circle',
    },
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      customContent: (title: string, items: any[]) => {
        if (!items?.length) return '';
        const item = items[0];
        return `
          <div style="padding: 8px;">
            <div><strong>Date:</strong> ${title}</div>
            <div><strong>Sensor:</strong> ${item.data.sensor}</div>
            <div><strong>User:</strong> ${item.data.user}</div>
            <div><strong>Power:</strong> ${item.data.power} kW</div>
            <div><strong>Heat:</strong> ${item.data.heat}°C</div>
          </div>
        `;
      },
    },
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  const columnConfig = {
    data: aggregatedData,
    xField: 'category',
    yField: 'totalPower',
    label: {
      position: 'top' as const,
      formatter: (text: string) => `${parseFloat(text).toFixed(1)} kW`,
    },
    tooltip: {
      customContent: (title: string, items: any[]) => {
        if (!items?.length) return '';
        const item = items[0];
        return `
          <div style="padding: 8px;">
            <div><strong>Sensor:</strong> ${item.data.sensorCode}</div>
            <div><strong>User:</strong> ${item.data.userName}</div>
            <div><strong>Total Power:</strong> ${item.data.totalPower.toFixed(2)} kW</div>
            <div><strong>Total Events:</strong> ${item.data.totalEvents}</div>
            <div><strong>Avg Heat:</strong> ${item.data.averageHeat.toFixed(1)}°C</div>
          </div>
        `;
      },
    },
    animation: {
      appear: {
        animation: 'scale-in-y',
        duration: 800,
      },
    },
  };

  if (eventsError) {
    return (
      <Card title="Events Aggregation">
        <Alert
          message="Error Loading Data"
          description={eventsError.message}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card
      title="Events Aggregation by Sensor and User"
      loading={isLoading}
      extra={
        showFilters && (
          <Row gutter={16}>
            <Col>
              <Select
                placeholder="Select User"
                style={{ width: 150 }}
                allowClear
                value={selectedUser}
                onChange={setSelectedUser}
                loading={usersLoading}
              >
                {users?.map(user => (
                  <Option key={user.uuid} value={user.uuid}>
                    {user.name} {user.last_name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="Select Sensor"
                style={{ width: 150 }}
                allowClear
                value={selectedSensor}
                onChange={setSelectedSensor}
                loading={sensorsLoading}
              >
                {sensors?.map(sensor => (
                  <Option key={sensor.uuid} value={sensor.uuid}>
                    {sensor.code}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col>
              <RangePicker
                showTime
                onChange={(dates) => {
                  if (dates) {
                    setDateRange([
                      dates[0]?.toISOString() || '',
                      dates[1]?.toISOString() || '',
                    ]);
                  } else {
                    setDateRange(undefined);
                  }
                }}
              />
            </Col>
          </Row>
        )
      }
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" tip="Loading chart data..." />
        </div>
      ) : (
        <div style={{ height: 400 }}>
          {chartType === 'line' ? (
            <Line {...lineConfig} />
          ) : (
            <Column {...columnConfig} />
          )}
        </div>
      )}
    </Card>
  );
};

export default EventsAggregationChart;