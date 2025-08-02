import React from 'react';
import { 
  Card, Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, 
  Tag, Typography, Row, Col, Statistic, Progress, Select, Tooltip 
} from 'antd';
import { 
  ExperimentOutlined, EditOutlined, DeleteOutlined, PlusOutlined, 
  ThunderboltOutlined, FireOutlined, StopOutlined, PlayCircleOutlined,
  EnvironmentOutlined, UserOutlined 
} from '@ant-design/icons';
import { 
  useSensors, useCreateSensor, useUpdateSensor, useDeleteSensor, 
  useIncrementSensorEvents, useIncrementSensorShutdowns, useUsers 
} from '../../hooks';
import type { Sensor, CreateSensorDto, UpdateSensorDto } from '../../types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { Option } = Select;

const SensorManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [editingSensor, setEditingSensor] = React.useState<Sensor | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);

  const { data: sensors, isLoading } = useSensors();
  const { data: users } = useUsers();
  const createSensor = useCreateSensor();
  const updateSensor = useUpdateSensor();
  const deleteSensor = useDeleteSensor();
  const incrementEvents = useIncrementSensorEvents();
  const incrementShutdowns = useIncrementSensorShutdowns();

  const handleCreate = () => {
    setEditingSensor(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (sensor: Sensor) => {
    setEditingSensor(sensor);
    form.setFieldsValue({
      code: sensor.code,
      equip_address_uuid: sensor.equip_address_uuid,
      angle: sensor.angle,
      power_generate: sensor.power_generate,
      total_events: sensor.total_events,
      total_shutdown: sensor.total_shutdown,
    });
    setModalVisible(true);
  };

  const handleDelete = async (uuid: string) => {
    try {
      await deleteSensor.mutateAsync(uuid);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleSubmit = async (values: CreateSensorDto) => {
    try {
      if (editingSensor) {
        await updateSensor.mutateAsync({
          uuid: editingSensor.uuid,
          data: values,
        });
      } else {
        await createSensor.mutateAsync(values);
      }
      setModalVisible(false);
      form.resetFields();
      setEditingSensor(null);
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const handleIncrementEvents = async (uuid: string) => {
    try {
      await incrementEvents.mutateAsync(uuid);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleIncrementShutdowns = async (uuid: string) => {
    try {
      await incrementShutdowns.mutateAsync(uuid);
    } catch (error) {
      // Error handled in hook
    }
  };

  const getEfficiencyColor = (angle: number, power: number) => {
    const efficiency = (power / 1000) * 100; // Normalize to percentage
    if (efficiency >= 80) return '#52c41a';
    if (efficiency >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const columns: ColumnsType<Sensor> = [
    {
      title: 'Sensor',
      key: 'sensor',
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Text strong>{record.code}</Text>
          <Tag color="blue" size="small">
            {record.angle}° angle
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Owner',
      key: 'owner',
      render: (_, record) => (
        record.user ? (
          <Space>
            <UserOutlined style={{ color: '#1890ff' }} />
            <div>
              <Text>{record.user.name} {record.user.last_name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.user.document}
              </Text>
            </div>
          </Space>
        ) : (
          <Text type="secondary">No owner</Text>
        )
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => (
        record.location ? (
          <Tooltip title={`${record.location.street}, ${record.location.number}, ${record.location.city}`}>
            <Space>
              <EnvironmentOutlined style={{ color: '#faad14' }} />
              <div>
                <Text>{record.location.city}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {record.location.state}
                </Text>
              </div>
            </Space>
          </Tooltip>
        ) : (
          <Text type="secondary">No location</Text>
        )
      ),
    },
    {
      title: 'Power & Performance',
      key: 'performance',
      render: (_, record) => (
        <Space direction="vertical" size={8}>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>Power Generation</Text>
            <br />
            <Text strong style={{ color: getEfficiencyColor(record.angle, record.power_generate) }}>
              {record.power_generate} kW
            </Text>
          </div>
          <Progress
            percent={Math.min((record.power_generate / 1000) * 100, 100)}
            size="small"
            strokeColor={getEfficiencyColor(record.angle, record.power_generate)}
            showInfo={false}
          />
        </Space>
      ),
    },
    {
      title: 'Events',
      key: 'events',
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Statistic
            value={record.total_events}
            valueStyle={{ fontSize: '14px' }}
            prefix={<PlayCircleOutlined style={{ color: '#52c41a' }} />}
          />
          <Button
            type="link"
            size="small"
            onClick={() => handleIncrementEvents(record.uuid)}
            loading={incrementEvents.isPending}
          >
            +1 Event
          </Button>
        </Space>
      ),
    },
    {
      title: 'Shutdowns',
      key: 'shutdowns',
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Statistic
            value={record.total_shutdown}
            valueStyle={{ fontSize: '14px' }}
            prefix={<StopOutlined style={{ color: '#ff4d4f' }} />}
          />
          <Button
            type="link"
            size="small"
            onClick={() => handleIncrementShutdowns(record.uuid)}
            loading={incrementShutdowns.isPending}
          >
            +1 Shutdown
          </Button>
          {record.last_shutdown && (
            <Text type="secondary" style={{ fontSize: '10px' }}>
              Last: {dayjs(record.last_shutdown).format('MMM DD')}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Delete Sensor"
            description="Are you sure you want to delete this sensor? This action cannot be undone."
            onConfirm={() => handleDelete(record.uuid)}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = React.useMemo(() => {
    if (!sensors) return { total: 0, totalPower: 0, avgEvents: 0, totalShutdowns: 0 };
    
    const totalPower = sensors.reduce((sum, sensor) => sum + sensor.power_generate, 0);
    const totalEvents = sensors.reduce((sum, sensor) => sum + sensor.total_events, 0);
    const totalShutdowns = sensors.reduce((sum, sensor) => sum + sensor.total_shutdown, 0);
    
    return {
      total: sensors.length,
      totalPower,
      avgEvents: sensors.length > 0 ? totalEvents / sensors.length : 0,
      totalShutdowns,
    };
  }, [sensors]);

  return (
    <div>
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Sensors"
              value={stats.total}
              prefix={<ExperimentOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Power"
              value={stats.totalPower}
              precision={1}
              suffix="kW"
              prefix={<ThunderboltOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Avg Events/Sensor"
              value={stats.avgEvents}
              precision={1}
              prefix={<PlayCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Shutdowns"
              value={stats.totalShutdowns}
              prefix={<StopOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Sensors Table */}
      <Card
        title={
          <Space>
            <ExperimentOutlined />
            Sensor Management
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Add Sensor
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={sensors}
          loading={isLoading}
          rowKey="uuid"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} sensors`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Sensor Modal */}
      <Modal
        title={editingSensor ? 'Edit Sensor' : 'Create Sensor'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingSensor(null);
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="code"
                label="Sensor Code"
                rules={[
                  { required: true, message: 'Please enter sensor code' },
                  { max: 100, message: 'Code must be less than 100 characters' },
                ]}
              >
                <Input placeholder="Enter unique sensor code" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="equip_address_uuid"
                label="Equipment Address"
                rules={[
                  { required: true, message: 'Please select equipment address' },
                ]}
              >
                <Input placeholder="Enter address UUID" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="angle"
                label="Angle (degrees)"
                rules={[
                  { required: true, message: 'Please enter angle' },
                  { type: 'number', min: 0, max: 360, message: 'Angle must be between 0-360°' },
                ]}
              >
                <InputNumber
                  min={0}
                  max={360}
                  placeholder="0-360"
                  style={{ width: '100%' }}
                  addonAfter="°"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="power_generate"
                label="Power Generation (kW)"
                rules={[
                  { required: true, message: 'Please enter power generation' },
                  { type: 'number', min: 0, message: 'Power must be positive' },
                ]}
              >
                <InputNumber
                  min={0}
                  placeholder="Power in kW"
                  style={{ width: '100%' }}
                  addonAfter="kW"
                />
              </Form.Item>
            </Col>
          </Row>

          {editingSensor && (
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="total_events"
                  label="Total Events"
                >
                  <InputNumber
                    min={0}
                    placeholder="Total events"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="total_shutdown"
                  label="Total Shutdowns"
                >
                  <InputNumber
                    min={0}
                    placeholder="Total shutdowns"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setEditingSensor(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createSensor.isPending || updateSensor.isPending}
              >
                {editingSensor ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SensorManagement;