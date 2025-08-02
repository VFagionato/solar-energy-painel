import React from 'react';
import { Card, Form, Input, Select, DatePicker, InputNumber, Button, Row, Col, Collapse, Space } from 'antd';
import { SearchOutlined, ClearOutlined, FilterOutlined } from '@ant-design/icons';
import type { SearchUserDto, SearchSensorDto, SearchEventDto } from '../../types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Panel } = Collapse;

interface AdvancedFiltersProps {
  onUserSearch?: (filters: SearchUserDto) => void;
  onSensorSearch?: (filters: SearchSensorDto) => void;
  onEventSearch?: (filters: SearchEventDto) => void;
  loading?: boolean;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onUserSearch,
  onSensorSearch,
  onEventSearch,
  loading = false,
}) => {
  const [userForm] = Form.useForm();
  const [sensorForm] = Form.useForm();
  const [eventForm] = Form.useForm();

  const handleUserSearch = (values: any) => {
    const filters: SearchUserDto = {};
    if (values.name) filters.name = values.name;
    if (values.last_name) filters.last_name = values.last_name;
    if (values.document) filters.document = values.document;
    if (values.search) filters.search = values.search;
    
    onUserSearch?.(filters);
  };

  const handleSensorSearch = (values: any) => {
    const filters: SearchSensorDto = {};
    if (values.code) filters.code = values.code;
    if (values.min_total_events !== undefined) filters.min_total_events = values.min_total_events;
    if (values.max_total_events !== undefined) filters.max_total_events = values.max_total_events;
    if (values.min_angle !== undefined) filters.min_angle = values.min_angle;
    if (values.max_angle !== undefined) filters.max_angle = values.max_angle;
    if (values.min_power_generate !== undefined) filters.min_power_generate = values.min_power_generate;
    if (values.max_power_generate !== undefined) filters.max_power_generate = values.max_power_generate;
    if (values.search) filters.search = values.search;
    
    onSensorSearch?.(filters);
  };

  const handleEventSearch = (values: any) => {
    const filters: SearchEventDto = {};
    if (values.min_power_generated !== undefined) filters.min_power_generated = values.min_power_generated;
    if (values.max_power_generated !== undefined) filters.max_power_generated = values.max_power_generated;
    if (values.min_heat !== undefined) filters.min_heat = values.min_heat;
    if (values.max_heat !== undefined) filters.max_heat = values.max_heat;
    if (values.dateRange) {
      filters.start_date = values.dateRange[0].toISOString();
      filters.end_date = values.dateRange[1].toISOString();
    }
    
    onEventSearch?.(filters);
  };

  const clearAllForms = () => {
    userForm.resetFields();
    sensorForm.resetFields();
    eventForm.resetFields();
  };

  return (
    <Card title={
      <Space>
        <FilterOutlined />
        Advanced Filters
      </Space>
    }>
      <Collapse defaultActiveKey={['users']} size="small">
        <Panel header="User Filters" key="users">
          <Form
            form={userForm}
            layout="vertical"
            onFinish={handleUserSearch}
            size="small"
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="search" label="General Search">
                  <Input placeholder="Search across all fields" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="name" label="First Name">
                  <Input placeholder="Enter first name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="last_name" label="Last Name">
                  <Input placeholder="Enter last name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="document" label="Document">
                  <Input placeholder="Enter document number" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                  Search Users
                </Button>
                <Button onClick={() => userForm.resetFields()} icon={<ClearOutlined />}>
                  Clear
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Panel>

        <Panel header="Sensor Filters" key="sensors">
          <Form
            form={sensorForm}
            layout="vertical"
            onFinish={handleSensorSearch}
            size="small"
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="search" label="General Search">
                  <Input placeholder="Search sensor codes" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="code" label="Sensor Code">
                  <Input placeholder="Enter sensor code" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="min_total_events" label="Min Events">
                  <InputNumber min={0} placeholder="Min events" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="max_total_events" label="Max Events">
                  <InputNumber min={0} placeholder="Max events" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="min_angle" label="Min Angle">
                  <InputNumber min={0} max={360} placeholder="Min angle" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="max_angle" label="Max Angle">
                  <InputNumber min={0} max={360} placeholder="Max angle" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="min_power_generate" label="Min Power (kW)">
                  <InputNumber min={0} placeholder="Min power" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="max_power_generate" label="Max Power (kW)">
                  <InputNumber min={0} placeholder="Max power" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                  Search Sensors
                </Button>
                <Button onClick={() => sensorForm.resetFields()} icon={<ClearOutlined />}>
                  Clear
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Panel>

        <Panel header="Event Filters" key="events">
          <Form
            form={eventForm}
            layout="vertical"
            onFinish={handleEventSearch}
            size="small"
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="dateRange" label="Date Range">
                  <RangePicker 
                    showTime
                    style={{ width: '100%' }}
                    ranges={{
                      'Today': [dayjs().startOf('day'), dayjs().endOf('day')],
                      'This Week': [dayjs().startOf('week'), dayjs().endOf('week')],
                      'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
                      'Last 30 Days': [dayjs().subtract(30, 'days'), dayjs()],
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="min_power_generated" label="Min Power (kW)">
                  <InputNumber min={0} placeholder="Min power" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="max_power_generated" label="Max Power (kW)">
                  <InputNumber min={0} placeholder="Max power" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="min_heat" label="Min Heat (°C)">
                  <InputNumber placeholder="Min heat" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="max_heat" label="Max Heat (°C)">
                  <InputNumber placeholder="Max heat" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                  Search Events
                </Button>
                <Button onClick={() => eventForm.resetFields()} icon={<ClearOutlined />}>
                  Clear
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Panel>
      </Collapse>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Button onClick={clearAllForms} icon={<ClearOutlined />} size="small">
          Clear All Filters
        </Button>
      </div>
    </Card>
  );
};

export default AdvancedFilters;