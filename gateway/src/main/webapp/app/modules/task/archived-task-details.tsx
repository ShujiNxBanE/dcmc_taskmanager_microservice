import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Table, Spin, message } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { TaskSimpleDTO, TaskDetailsDTO, UserDTO } from 'app/rest/dto';
import taskClientApi from 'app/rest/TaskClientApi';
import CommentSectionReadonly from './comment-section-readonly';

const ArchivedTaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskDetailsDTO | null>(null);
  const [subTasks, setSubTasks] = useState<TaskSimpleDTO[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTasksLoading, setSubTasksLoading] = useState(false);
  const [assignedUsersLoading, setAssignedUsersLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadTaskDetails();
      loadSubTasks();
      loadAssignedUsers();
    }
  }, [id]);

  const loadTaskDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await taskClientApi.getTaskDetails(parseInt(id, 10));
      setTask(response.data);
    } catch (error: any) {
      message.error('Error loading task details');
      console.error('Error loading task details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubTasks = async () => {
    if (!id) return;
    setSubTasksLoading(true);
    try {
      const response = await taskClientApi.getSubTasks(parseInt(id, 10));
      setSubTasks(response.data);
    } catch (error: any) {
      message.error('Error loading subtasks');
      console.error('Error loading subtasks:', error);
    } finally {
      setSubTasksLoading(false);
    }
  };

  const loadAssignedUsers = async () => {
    if (!id) return;
    setAssignedUsersLoading(true);
    try {
      const response = await taskClientApi.getAssignedUsers(parseInt(id, 10));
      setAssignedUsers(response.data);
    } catch (error: any) {
      message.error('Error loading assigned users');
      console.error('Error loading assigned users:', error);
    } finally {
      setAssignedUsersLoading(false);
    }
  };

  const subTaskColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <div style={{ fontWeight: 600, color: '#1f2937' }}>{text}</div>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <div style={{ color: '#6b7280', maxWidth: 300 }}>{text && text.length > 100 ? `${text.substring(0, 100)}...` : text}</div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priorityName',
      key: 'priorityName',
      render: (priority: string) => <Tag color="red">{priority}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'statusName',
      key: 'statusName',
      render: (status: string) => <Tag color="blue">{status}</Tag>,
    },
    {
      title: 'Creator',
      dataIndex: 'creatorLogin',
      key: 'creatorLogin',
      render: (login: string) => <Tag color="purple">@{login}</Tag>,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!task) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Task not found</h2>
        <Button type="primary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: '16px' }}>
          Back
        </Button>

        <Card title="Archived Task Details">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Title" span={2}>
              <strong>{task.title}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {task.description || 'No description'}
            </Descriptions.Item>
            <Descriptions.Item label="Priority">
              <Tag color="red">{task.priorityName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color="blue">{task.statusName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Creator">
              <Tag color="purple">@{task.creatorLogin}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Creation Time">
              {task.createTime ? new Date(task.createTime).toLocaleString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Last Update">
              {task.updateTime ? new Date(task.updateTime).toLocaleString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Archived">
              <Tag color="red">Yes</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>

      <Card title={`Subtasks (${subTasks.length})`}>
        <Table
          columns={subTaskColumns}
          dataSource={subTasks}
          rowKey="id"
          loading={subTasksLoading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No subtasks for this task' }}
        />
      </Card>

      <Card title={`Assigned Users (${assignedUsers.length})`} style={{ marginTop: '16px' }}>
        <Table
          columns={[
            {
              title: 'User',
              dataIndex: 'login',
              key: 'login',
              render: (login: string) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <span style={{ fontWeight: 500 }}>@{login}</span>
                </div>
              ),
            },
            {
              title: 'ID',
              dataIndex: 'id',
              key: 'id',
              render: (userId: number) => <Tag color="blue">{userId}</Tag>,
            },
          ]}
          dataSource={assignedUsers}
          rowKey="id"
          loading={assignedUsersLoading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No users assigned to this task' }}
        />
      </Card>

      <CommentSectionReadonly taskId={task?.id || 0} />
    </div>
  );
};

export default ArchivedTaskDetails;
