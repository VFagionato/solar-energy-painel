import {
  BarChartOutlined,
  CalendarOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined,
  SearchOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Avatar, Badge, Button, Card, Col, Layout, Menu, Row, Space, Switch, Typography } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { useEvents, useSensors, useUsers } from '../../hooks';
import EventsAggregationChart from '../charts/EventsAggregationChart';
import PowerGenerationChart from '../charts/PowerGenerationChart';
import SensorManagement from '../forms/SensorManagement';
import UserManagement from '../forms/UserManagement';
import AdvancedFilters from '../search/AdvancedFilters';
import GlobalSearch from '../search/GlobalSearch';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = React.useState('overview');
  const [selectedUser, setSelectedUser] = React.useState<string | undefined>();
  const [selectedSensor, setSelectedSensor] = React.useState<string | undefined>();
  const [chartType, setChartType] = React.useState<'line' | 'column'>('line');

  const { data: users } = useUsers();
  const { data: sensors } = useSensors();
  const { data: events } = useEvents();

  const handleSearch = (type: string, item: any) => {
    switch (type) {
      case 'user':
        setSelectedUser(item.uuid);
        setSelectedMenuItem('users');
        break;
      case 'sensor':
        setSelectedSensor(item.uuid);
        setSelectedMenuItem('sensors');
        break;
      case 'event':
        setSelectedMenuItem('overview');
        break;
    }
  };

  const handleFilterSearch = (type: 'user' | 'sensor' | 'event', filters: any) => {
    // This would trigger filtered results in the respective components
    console.log(`${type} search:`, filters);
  };

  const getDashboardStats = () => {
    const totalUsers = users?.length || 0;
    const totalSensors = sensors?.length || 0;
    const totalEvents = events?.length || 0;
    const totalPower = sensors ? sensors.reduce((sum, sensor) => sum + (Number(sensor.power_generate) || 0), 0) : 0;

    return { totalUsers, totalSensors, totalEvents, totalPower };
  };

  const stats = getDashboardStats();

  const menuItems = [
    {
      key: 'overview',
      icon: <DashboardOutlined />,
      label: 'Overview',
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: 'search',
      icon: <SearchOutlined />,
      label: 'Search & Filters',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Users',
    },
    {
      key: 'sensors',
      icon: <ExperimentOutlined />,
      label: 'Sensors',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const renderOverview = () => (
    <div>
      {/* Quick Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                size={48} 
                icon={<UserOutlined />} 
                style={{ backgroundColor: '#1890ff', marginRight: 16 }} 
              />
              <div>
                <Text type="secondary">Total Users</Text>
                <Title level={3} style={{ margin: 0 }}>{stats.totalUsers}</Title>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                size={48} 
                icon={<ExperimentOutlined />} 
                style={{ backgroundColor: '#52c41a', marginRight: 16 }} 
              />
              <div>
                <Text type="secondary">Active Sensors</Text>
                <Title level={3} style={{ margin: 0 }}>{stats.totalSensors}</Title>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                size={48} 
                icon={<ThunderboltOutlined />} 
                style={{ backgroundColor: '#faad14', marginRight: 16 }} 
              />
              <div>
                <Text type="secondary">Total Power</Text>
                <Title level={3} style={{ margin: 0 }}>{(stats.totalPower ?? 0)} kW</Title>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                size={48} 
                icon={<CalendarOutlined />} 
                style={{ backgroundColor: '#f5222d', marginRight: 16 }} 
              />
              <div>
                <Text type="secondary">Total Events</Text>
                <Title level={3} style={{ margin: 0 }}>{stats.totalEvents}</Title>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Chart */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            title="Real-time Monitoring"
            extra={
              <Space>
                <Text>Chart Type:</Text>
                <Switch
                  checkedChildren="Column"
                  unCheckedChildren="Line"
                  checked={chartType === 'column'}
                  onChange={(checked) => setChartType(checked ? 'column' : 'line')}
                />
              </Space>
            }
          >
            <EventsAggregationChart chartType={chartType} />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderAnalytics = () => (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <PowerGenerationChart timeRange="week" />
      </Col>
      <Col xs={24} lg={12}>
        <EventsAggregationChart chartType="line" showFilters={false} />
      </Col>
      <Col xs={24} lg={12}>
        <EventsAggregationChart chartType="column" showFilters={false} />
      </Col>
    </Row>
  );

  const renderSearch = () => (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <Card title="Global Search">
          <GlobalSearch
            onSelect={handleSearch}
            placeholder="Search users, sensors, events..."
          />
        </Card>
      </Col>
      <Col span={24}>
        <AdvancedFilters
          onUserSearch={(filters) => handleFilterSearch('user', filters)}
          onSensorSearch={(filters) => handleFilterSearch('sensor', filters)}
          onEventSearch={(filters) => handleFilterSearch('event', filters)}
        />
      </Col>
    </Row>
  );

  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'overview':
        return renderOverview();
      case 'analytics':
        return renderAnalytics();
      case 'search':
        return renderSearch();
      case 'users':
        return <UserManagement />;
      case 'sensors':
        return <SensorManagement />;
      case 'settings':
        return (
          <Card title="Settings">
            <p>Settings panel coming soon...</p>
          </Card>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="light"
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          {!collapsed && (
            <Space>
              <ThunderboltOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                Solar Winds
              </Title>
            </Space>
          )}
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[selectedMenuItem]}
          items={menuItems}
          style={{ borderRight: 0 }}
          onClick={({ key }) => setSelectedMenuItem(key)}
        />
      </Sider>

      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ marginRight: 16 }}
            />
            <Title level={4} style={{ margin: 0 }}>
              Solar Energy Monitoring Dashboard
            </Title>
          </div>

          <div style={{ flex: 1, maxWidth: 400, margin: '0 24px' }}>
            <GlobalSearch onSelect={handleSearch} />
          </div>

          <Space>
            <Badge count={stats.totalEvents} overflowCount={999}>
              <Avatar icon={<CalendarOutlined />} />
            </Badge>
            <Text>
              {dayjs().format('MMM DD, YYYY HH:mm')}
            </Text>
          </Space>
        </Header>

        <Content style={{ 
          margin: '24px', 
          minHeight: 280,
        }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;