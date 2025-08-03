import React from 'react';
import { Card, Spin, Alert, Row, Col, Statistic } from 'antd';
import { Area, Gauge } from '@ant-design/charts';
import { ThunderboltOutlined, FireOutlined, DashboardOutlined } from '@ant-design/icons';
import { useEvents } from '../../hooks';
import dayjs from 'dayjs';

interface PowerGenerationChartProps {
  sensorUuid?: string;
  timeRange?: 'day' | 'week' | 'month';
}

const PowerGenerationChart: React.FC<PowerGenerationChartProps> = React.memo(({
  sensorUuid,
  timeRange = 'day',
}) => {
  const { startDate, endDate } = React.useMemo(() => {
    const now = dayjs();
    let start: dayjs.Dayjs;
    
    switch (timeRange) {
      case 'day':
        start = now.subtract(1, 'day');
        break;
      case 'week':
        start = now.subtract(1, 'week');
        break;
      case 'month':
        start = now.subtract(1, 'month');
        break;
      default:
        start = now.subtract(1, 'day');
    }
    
    return {
      startDate: start.toISOString(),
      endDate: now.toISOString(),
    };
  }, [timeRange]);

  const { data: events, isLoading, error } = useEvents(startDate, endDate);

  const filteredEvents = React.useMemo(() => {
    if (!events) return [];
    return sensorUuid 
      ? events.filter(event => event.sensor_uuid === sensorUuid)
      : events;
  }, [events, sensorUuid]);

  const chartData = React.useMemo(() => {
    return filteredEvents.map(event => ({
      time: dayjs(event.timestamp).format('HH:mm'),
      power: Number(event.power_generated) || 0,
      heat: Number(event.heat) || 0,
      date: dayjs(event.timestamp).format('YYYY-MM-DD'),
    })).sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());
  }, [filteredEvents]);

  const stats = React.useMemo(() => {
    if (!filteredEvents.length) {
      return {
        totalPower: 0,
        averagePower: 0,
        maxPower: 0,
        averageHeat: 0,
        efficiency: 0,
      };
    }

    const totalPower = filteredEvents.reduce((sum, event) => sum + (Number(event.power_generated) || 0), 0);
    const totalHeat = filteredEvents.reduce((sum, event) => sum + (Number(event.heat) || 0), 0);
    const maxPower = Math.max(...filteredEvents.map(event => Number(event.power_generated) || 0));
    const averagePower = filteredEvents.length > 0 ? totalPower / filteredEvents.length : 0;
    const averageHeat = filteredEvents.length > 0 ? totalHeat / filteredEvents.length : 0;
    
    // Simple efficiency calculation based on power vs heat ratio
    const efficiency = averageHeat > 0 && averagePower > 0 ? Math.min((averagePower / averageHeat) * 10, 100) : 0;

    return {
      totalPower,
      averagePower,
      maxPower,
      averageHeat,
      efficiency,
    };
  }, [filteredEvents]);

  const areaConfig = React.useMemo(() => ({
    data: chartData,
    xField: 'time',
    yField: 'power',
    smooth: true,
    line: {
      color: '#1890ff',
    },
    areaStyle: {
      fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
    },
    point: {
      size: 3,
      shape: 'circle',
      style: {
        fill: '#1890ff',
        stroke: '#ffffff',
        lineWidth: 2,
      },
    },
    tooltip: {
      customContent: (title: string, items: any[]) => {
        if (!items?.length) return '';
        const item = items[0];
        return `
          <div style="padding: 8px;">
            <div><strong>Time:</strong> ${title}</div>
            <div><strong>Power:</strong> ${item.data.power} kW</div>
            <div><strong>Heat:</strong> ${item.data.heat}°C</div>
          </div>
        `;
      },
    },
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 1500,
      },
    },
  }), [chartData]);

  const gaugeConfig = React.useMemo(() => ({
    percent: stats.efficiency / 100,
    range: {
      color: '#30BF78',
      width: 12,
    },
    indicator: {
      pointer: {
        style: {
          stroke: '#D0D0D0',
        },
      },
      pin: {
        style: {
          stroke: '#D0D0D0',
        },
      },
    },
    statistic: {
      content: {
        style: {
          fontSize: '36px',
          lineHeight: '36px',
        },
        formatter: () => `${(stats.efficiency || 0).toFixed(1)}%`,
      },
    },
    animation: {
      appear: {
        animation: 'fade-in',
        duration: 1000,
      },
    },
  }), [stats.efficiency]);

  if (error) {
    return (
      <Card title="Power Generation Overview">
        <Alert
          message="Error Loading Data"
          description={error.message}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card title="Power Generation Overview" loading={isLoading}>
      <Row gutter={[24, 24]}>
        {/* Statistics */}
        <Col span={24}>
          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Statistic
                title="Total Power Generated"
                value={stats.totalPower}
                precision={2}
                suffix="kW"
                prefix={<ThunderboltOutlined style={{ color: '#1890ff' }} />}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Average Power"
                value={stats.averagePower}
                precision={2}
                suffix="kW"
                prefix={<DashboardOutlined style={{ color: '#52c41a' }} />}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Peak Power"
                value={stats.maxPower}
                precision={2}
                suffix="kW"
                prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Average Heat"
                value={stats.averageHeat}
                precision={1}
                suffix="°C"
                prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
              />
            </Col>
          </Row>
        </Col>

        {/* Charts */}
        <Col xs={24} lg={16}>
          <Card title="Power Generation Timeline" size="small">
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="Loading power data..." />
              </div>
            ) : (
              <div style={{ height: 300 }}>
                <Area {...areaConfig} />
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Efficiency Score" size="small">
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="Calculating efficiency..." />
              </div>
            ) : (
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Gauge {...gaugeConfig} />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Card>
  );
});

export default PowerGenerationChart;