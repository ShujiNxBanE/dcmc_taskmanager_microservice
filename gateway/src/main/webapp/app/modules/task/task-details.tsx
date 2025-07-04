import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Table, Space, message, Spin, Popconfirm } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, InboxOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import { TaskSimpleDTO, TaskDetailsDTO, UserDTO } from 'app/rest/dto';
import taskClientApi from 'app/rest/TaskClientApi';
import projectClientApi from 'app/rest/ProjectClientApi';
import { useAppSelector } from 'app/config/store';
import { AUTHORITIES } from 'app/config/constants';
import EditTaskModal from './edit-task-modal';
import AssignUsersModal from './assign-users-modal';
import CreateSubTaskModal from './create-subtask-modal';
import CommentSection from './comment-section';

const TaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskDetailsDTO | null>(null);
  const [subTasks, setSubTasks] = useState<TaskSimpleDTO[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTasksLoading, setSubTasksLoading] = useState(false);
  const [assignedUsersLoading, setAssignedUsersLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignUsersModalOpen, setAssignUsersModalOpen] = useState(false);
  const [createSubTaskModalOpen, setCreateSubTaskModalOpen] = useState(false);
  const [editSubTaskModalOpen, setEditSubTaskModalOpen] = useState(false);
  const [editSubTask, setEditSubTask] = useState<TaskSimpleDTO | null>(null);
  const currentUser = useAppSelector(state => state.authentication.account?.login);
  const authorities = useAppSelector(state => state.authentication.account?.authorities ?? []);
  const isOwnerOrModerator = authorities.includes(AUTHORITIES.OWNER) || authorities.includes(AUTHORITIES.MODERATOR);

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

  const handleSuccess = () => {
    loadTaskDetails();
    loadSubTasks();
    loadAssignedUsers();
  };

  const handleArchive = async () => {
    if (!task?.id) return;
    try {
      await taskClientApi.archiveTask(task.id);
      message.success('Task archived successfully');
      navigate(-1);
    } catch (error: any) {
      message.error('Error archiving task');
    }
  };

  const handleDelete = async () => {
    if (!task?.id) return;
    try {
      await taskClientApi.deleteTask(task.id);
      message.success('Task deleted successfully');
      navigate(-1);
    } catch (error: any) {
      message.error('Error deleting task');
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
    {
      title: 'Actions',
      key: 'acciones',
      render: (_: any, record: TaskSimpleDTO) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setEditSubTask(record);
              setEditSubTaskModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button type="link" onClick={() => navigate(`/task/subtask/${record.id}`)}>
            View Details
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this subtask?"
            okText="Yes"
            cancelText="No"
            onConfirm={async () => {
              if (!record.id) return message.error('Invalid subtask ID');
              try {
                await taskClientApi.deleteTask(record.id);
                message.success('Subtask deleted successfully');
                handleSuccess();
              } catch (err: any) {
                message.error(err.response?.data?.detail || err.message || 'Error deleting subtask');
              }
            }}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Are you sure you want to archive this subtask?"
            okText="Yes"
            cancelText="No"
            onConfirm={async () => {
              if (!record.id) return message.error('Invalid subtask ID');
              try {
                await taskClientApi.archiveTask(record.id);
                message.success('Subtask archived successfully');
                handleSuccess();
              } catch (err: any) {
                message.error(err.response?.data?.detail || err.message || 'Error archiving subtask');
              }
            }}
          >
            <Button type="link" style={{ color: '#8e24aa' }}>
              Archive
            </Button>
          </Popconfirm>
        </Space>
      ),
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

        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Task Details</span>
              <Space>
                {task.creatorLogin === currentUser && (
                  <Button type="primary" icon={<EditOutlined />} onClick={() => setEditModalOpen(true)}>
                    Edit
                  </Button>
                )}
                <Popconfirm title="Are you sure you want to archive this task?" okText="Yes" cancelText="No" onConfirm={handleArchive}>
                  <Button icon={<InboxOutlined />} style={{ color: '#8e24aa' }}>
                    Archive
                  </Button>
                </Popconfirm>
                {(task.creatorLogin === currentUser || isOwnerOrModerator) && (
                  <Popconfirm title="Are you sure you want to delete this task?" okText="Yes" cancelText="No" onConfirm={handleDelete}>
                    <Button danger icon={<DeleteOutlined />}>
                      Delete
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            </div>
          }
        >
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
            <Descriptions.Item label="Creation Date">
              {task.createTime ? new Date(task.createTime).toLocaleString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Last Update">
              {task.updateTime ? new Date(task.updateTime).toLocaleString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Archived">
              <Tag color={task.archived ? 'red' : 'green'}>{task.archived ? 'Yes' : 'No'}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>

      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Subtasks ({subTasks.length})</span>
            <Button type="primary" onClick={() => setCreateSubTaskModalOpen(true)}>
              Create Subtask
            </Button>
          </div>
        }
      >
        <Table
          columns={subTaskColumns}
          dataSource={subTasks}
          rowKey="id"
          loading={subTasksLoading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No subtasks for this task' }}
        />
      </Card>

      <Card
        title={`Assigned Users (${assignedUsers.length})`}
        style={{ marginTop: '16px' }}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAssignUsersModalOpen(true)}
            disabled={!task?.projectId || !task?.workGroupId}
          >
            Assign Users
          </Button>
        }
      >
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
            {
              title: 'Actions',
              key: 'acciones',
              render: (_: any, record: UserDTO) => (
                <Popconfirm
                  title="Are you sure you want to unassign this user from the task?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={async () => {
                    if (!task?.workGroupId || !task?.id) return message.error('Missing task data');
                    try {
                      await taskClientApi.unassignUsersFromTask(task.workGroupId, task.id, [record.id.toString()]);
                      message.success('User unassigned successfully');
                      handleSuccess();
                    } catch (err: any) {
                      message.error(err.response?.data?.detail || err.message || 'Error unassigning user');
                    }
                  }}
                >
                  <Button type="link" danger>
                    Unassign
                  </Button>
                </Popconfirm>
              ),
            },
          ]}
          dataSource={assignedUsers}
          rowKey="id"
          loading={assignedUsersLoading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No users assigned to this task' }}
        />
      </Card>

      <CommentSection
        taskId={task?.id || 0}
        projectId={task?.projectId || 0}
        workGroupId={task?.workGroupId || 0}
        onSuccess={handleSuccess}
      />

      <EditTaskModal open={editModalOpen} onCancel={() => setEditModalOpen(false)} onSuccess={handleSuccess} task={task} />

      <AssignUsersModal
        open={assignUsersModalOpen}
        onCancel={() => setAssignUsersModalOpen(false)}
        onSuccess={handleSuccess}
        taskId={task?.id || 0}
        workGroupId={task?.workGroupId || 0}
        projectId={task?.projectId || 0}
        currentAssignedUsers={assignedUsers}
      />

      <CreateSubTaskModal
        open={createSubTaskModalOpen}
        onCancel={() => setCreateSubTaskModalOpen(false)}
        onSuccess={handleSuccess}
        projectId={task?.projectId || 0}
        workGroupId={task?.workGroupId || 0}
        parentTaskId={task?.id || 0}
      />

      <EditTaskModal
        open={editSubTaskModalOpen}
        onCancel={() => setEditSubTaskModalOpen(false)}
        onSuccess={handleSuccess}
        task={editSubTask}
      />
    </div>
  );
};

export default TaskDetails;
