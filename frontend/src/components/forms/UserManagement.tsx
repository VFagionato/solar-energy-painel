import React from 'react';
import { 
  Card, Table, Button, Modal, Form, Input, Space, Popconfirm, 
  Avatar, Tag, Typography, Row, Col, Statistic, message 
} from 'antd';
import { 
  UserOutlined, EditOutlined, DeleteOutlined, PlusOutlined, 
  ExperimentOutlined, EnvironmentOutlined 
} from '@ant-design/icons';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../hooks';
import type { User, CreateUserDto, UpdateUserDto } from '../../types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const UserManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);

  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      last_name: user.last_name,
      document: user.document,
    });
    setModalVisible(true);
  };

  const handleDelete = async (uuid: string) => {
    try {
      await deleteUser.mutateAsync(uuid);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleSubmit = async (values: CreateUserDto) => {
    try {
      if (editingUser) {
        await updateUser.mutateAsync({
          uuid: editingUser.uuid,
          data: values,
        });
      } else {
        await createUser.mutateAsync(values);
      }
      setModalVisible(false);
      form.resetFields();
      setEditingUser(null);
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{record.name} {record.last_name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.document}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Address',
      key: 'address',
      render: (_, record) => (
        record.address ? (
          <div>
            <Text>{record.address.street}, {record.address.number}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.address.city}, {record.address.state}
            </Text>
          </div>
        ) : (
          <Text type="secondary">No address</Text>
        )
      ),
    },
    {
      title: 'Sensors',
      key: 'sensors',
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Statistic
            value={record.sensors?.length || 0}
            prefix={<ExperimentOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ fontSize: '14px' }}
          />
          {record.sensors?.map(sensor => (
            <Tag key={sensor.uuid} color="green" size="small">
              {sensor.code}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <Text type="secondary">
          {dayjs(date).format('MMM DD, YYYY')}
        </Text>
      ),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
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
            title="Delete User"
            description="Are you sure you want to delete this user? This action cannot be undone."
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
    if (!users) return { total: 0, withSensors: 0, withAddress: 0 };
    
    return {
      total: users.length,
      withSensors: users.filter(user => user.sensors && user.sensors.length > 0).length,
      withAddress: users.filter(user => user.address).length,
    };
  }, [users]);

  return (
    <div>
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Total Users"
              value={stats.total}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Users with Sensors"
              value={stats.withSensors}
              prefix={<ExperimentOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Users with Address"
              value={stats.withAddress}
              prefix={<EnvironmentOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Users Table */}
      <Card
        title={
          <Space>
            <UserOutlined />
            User Management
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Add User
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          loading={isLoading}
          rowKey="uuid"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} users`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* User Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Create User'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingUser(null);
        }}
        footer={null}
        width={600}
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
                name="name"
                label="First Name"
                rules={[
                  { required: true, message: 'Please enter first name' },
                  { max: 100, message: 'Name must be less than 100 characters' },
                ]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="last_name"
                label="Last Name"
                rules={[
                  { required: true, message: 'Please enter last name' },
                  { max: 100, message: 'Last name must be less than 100 characters' },
                ]}
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="document"
            label="Document Number"
            rules={[
              { required: true, message: 'Please enter document number' },
              { max: 50, message: 'Document must be less than 50 characters' },
            ]}
          >
            <Input placeholder="Enter document number (CPF, ID, etc.)" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setEditingUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createUser.isPending || updateUser.isPending}
              >
                {editingUser ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;