import React, { useEffect, useState } from 'react';
import { Tabs, Table, Tag, Space, Button, Popconfirm, message, Select } from 'antd';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';
import { TaskSimpleDTO } from 'app/rest/dto';
import taskClientApi from 'app/rest/TaskClientApi';
import { UserOutlined, PlusOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import projectClientApi from 'app/rest/ProjectClientApi';
import CreateTaskModal from './create-task-modal';
import { useAppSelector } from 'app/config/store';
import EditTaskModal from './edit-task-modal';
import { AUTHORITIES } from 'app/config/constants';
import { useNavigate } from 'react-router-dom';

const TaskUser = () => {
  const navigate = useNavigate();
  const [assignedTasks, setAssignedTasks] = useState<TaskSimpleDTO[]>([]);
  const [assignedSubTasks, setAssignedSubTasks] = useState<TaskSimpleDTO[]>([]);
  const [createdTasks, setCreatedTasks] = useState<TaskSimpleDTO[]>([]);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [loadingAssignedSubTasks, setLoadingAssignedSubTasks] = useState(false);
  const [loadingCreated, setLoadingCreated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasProjects, setHasProjects] = useState(false);
  const currentUser = useAppSelector(state => state.authentication.account?.login);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskSimpleDTO | null>(null);
  const [archivedTasks, setArchivedTasks] = useState<TaskSimpleDTO[]>([]);
  const [archivedLoading, setArchivedLoading] = useState(false);
  const [assignedProjects, setAssignedProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const authorities = useAppSelector(state => state.authentication.account?.authorities ?? []);
  const isOwnerOrModerator = authorities.includes(AUTHORITIES.OWNER) || authorities.includes(AUTHORITIES.MODERATOR);

  useEffect(() => {
    loadAssignedTasks();
    loadAssignedSubTasks();
    loadCreatedTasks();
    projectClientApi.getAssignedProjects().then(r => {
      setHasProjects(r.data.length > 0);
      setAssignedProjects(r.data);
      if (r.data.length > 0) setSelectedProjectId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      setArchivedLoading(true);
      taskClientApi
        .getArchivedTasksByProject(selectedProjectId)
        .then(r => setArchivedTasks(r.data))
        .finally(() => setArchivedLoading(false));
    }
  }, [selectedProjectId]);

  const loadAssignedTasks = async () => {
    setLoadingAssigned(true);
    try {
      const res = await taskClientApi.getAssignedTasks();
      setAssignedTasks(res.data);
    } finally {
      setLoadingAssigned(false);
    }
  };

  const loadCreatedTasks = async () => {
    setLoadingCreated(true);
    try {
      const res = await taskClientApi.getCreatedTasks();
      setCreatedTasks(res.data);
    } finally {
      setLoadingCreated(false);
    }
  };

  const loadAssignedSubTasks = async () => {
    setLoadingAssignedSubTasks(true);
    try {
      const res = await taskClientApi.getAssignedSubTasks();
      setAssignedSubTasks(res.data);
    } finally {
      setLoadingAssignedSubTasks(false);
    }
  };

  const handleSuccess = () => {
    loadAssignedTasks();
    loadAssignedSubTasks();
    loadCreatedTasks();
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <div style={{ fontWeight: 600, color: '#1f2937' }}>{text}</div>,
      responsive: ['md' as Breakpoint],
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <div style={{ color: '#6b7280', maxWidth: 300 }}>{text && text.length > 100 ? `${text.substring(0, 100)}...` : text}</div>
      ),
      responsive: ['lg' as Breakpoint],
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
      responsive: ['md' as Breakpoint],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TaskSimpleDTO) => (
        <Space size="small" direction="vertical" style={{ width: '100%' }}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              if (record.archived) {
                navigate(`/task/archived/${record.id}`);
              } else {
                navigate(`/task/${record.id}`);
              }
            }}
            style={{ padding: 0, height: 'auto' }}
          >
            View Details
          </Button>
          {record.creatorLogin === currentUser && !record.archived && (
            <Button
              type="link"
              onClick={() => {
                setEditTask(record);
                setEditModalOpen(true);
              }}
              style={{ padding: 0, height: 'auto' }}
            >
              Edit
            </Button>
          )}
          {!record.archived && (
            <Popconfirm
              title="Are you sure you want to archive this task?"
              okText="Yes"
              cancelText="No"
              onConfirm={async () => {
                if (!record.id) return message.error('Invalid task ID');
                try {
                  await taskClientApi.archiveTask(record.id);
                  message.success('Task archived successfully');
                  handleSuccess();
                } catch (err: any) {
                  message.error(err.response?.data?.detail || err.message || 'Error archiving task');
                }
              }}
            >
              <Button type="link" style={{ color: '#8e24aa', padding: 0, height: 'auto' }}>
                Archive
              </Button>
            </Popconfirm>
          )}
          {record.archived && (
            <Popconfirm
              title="Are you sure you want to unarchive this task?"
              okText="Yes"
              cancelText="No"
              onConfirm={async () => {
                if (!record.id || !selectedProjectId) return message.error('Invalid task or project ID');
                try {
                  await taskClientApi.unarchiveTask(record.id);
                  message.success('Task unarchived successfully');
                  setArchivedLoading(true);
                  taskClientApi
                    .getArchivedTasksByProject(selectedProjectId)
                    .then(r => setArchivedTasks(r.data))
                    .finally(() => setArchivedLoading(false));
                  handleSuccess();
                } catch (err: any) {
                  message.error(err.response?.data?.detail || err.message || 'Error unarchiving task');
                }
              }}
            >
              <Button type="link" style={{ color: '#1976d2', padding: 0, height: 'auto' }}>
                Unarchive
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="Are you sure you want to delete this task?"
            okText="Yes"
            cancelText="No"
            onConfirm={async () => {
              if (!record.id) return message.error('Invalid task ID');
              try {
                await taskClientApi.deleteTask(record.id);
                message.success('Task deleted successfully');
                if (record.archived && selectedProjectId) {
                  setArchivedLoading(true);
                  taskClientApi
                    .getArchivedTasksByProject(selectedProjectId)
                    .then(r => setArchivedTasks(r.data))
                    .finally(() => setArchivedLoading(false));
                }
                handleSuccess();
              } catch (err: any) {
                message.error(err.response?.data?.detail || err.message || 'Error deleting task');
              }
            }}
          >
            <Button type="link" danger style={{ padding: 0, height: 'auto' }}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const subTaskColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <div
          style={{
            fontWeight: 600,
            color: '#8e24aa',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              color: '#8e24aa',
              marginRight: '8px',
              fontWeight: 'normal',
            }}
          ></span>
          {text}
        </div>
      ),
      responsive: ['md' as Breakpoint],
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <div style={{ color: '#6b7280', maxWidth: 300 }}>{text && text.length > 100 ? `${text.substring(0, 100)}...` : text}</div>
      ),
      responsive: ['lg' as Breakpoint],
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
      responsive: ['md' as Breakpoint],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TaskSimpleDTO) => (
        <Space size="small" direction="vertical" style={{ width: '100%' }}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              if (record.archived) {
                navigate(`/task/archived/${record.id}`);
              } else {
                navigate(`/task/subtask/${record.id}`);
              }
            }}
            style={{ padding: 0, height: 'auto' }}
          >
            View Details
          </Button>
          {record.creatorLogin === currentUser && !record.archived && (
            <Button
              type="link"
              onClick={() => {
                setEditTask(record);
                setEditModalOpen(true);
              }}
              style={{ padding: 0, height: 'auto' }}
            >
              Edit
            </Button>
          )}
          {!record.archived && (
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
              <Button type="link" style={{ color: '#8e24aa', padding: 0, height: 'auto' }}>
                Archive
              </Button>
            </Popconfirm>
          )}
          {record.archived && (
            <Popconfirm
              title="Are you sure you want to unarchive this subtask?"
              okText="Yes"
              cancelText="No"
              onConfirm={async () => {
                if (!record.id || !selectedProjectId) return message.error('Invalid subtask or project ID');
                try {
                  await taskClientApi.unarchiveTask(record.id);
                  message.success('Subtask unarchived successfully');
                  setArchivedLoading(true);
                  taskClientApi
                    .getArchivedTasksByProject(selectedProjectId)
                    .then(r => setArchivedTasks(r.data))
                    .finally(() => setArchivedLoading(false));
                  handleSuccess();
                } catch (err: any) {
                  message.error(err.response?.data?.detail || err.message || 'Error unarchiving subtask');
                }
              }}
            >
              <Button type="link" style={{ color: '#1976d2', padding: 0, height: 'auto' }}>
                Unarchive
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="Are you sure you want to delete this subtask?"
            okText="Yes"
            cancelText="No"
            onConfirm={async () => {
              if (!record.id) return message.error('Invalid subtask ID');
              try {
                await taskClientApi.deleteTask(record.id);
                message.success('Subtask deleted successfully');
                if (record.archived && selectedProjectId) {
                  setArchivedLoading(true);
                  taskClientApi
                    .getArchivedTasksByProject(selectedProjectId)
                    .then(r => setArchivedTasks(r.data))
                    .finally(() => setArchivedLoading(false));
                }
                handleSuccess();
              } catch (err: any) {
                message.error(err.response?.data?.detail || err.message || 'Error deleting subtask');
              }
            }}
          >
            <Button type="link" danger style={{ padding: 0, height: 'auto' }}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'assigned',
      label: (
        <span>
          <UserOutlined style={{ marginRight: 8 }} />
          Assigned Tasks ({assignedTasks.length + assignedSubTasks.length})
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ color: '#1f2937', marginBottom: '8px' }}> Main Tasks ({assignedTasks.length})</h4>
            <Table
              columns={columns}
              dataSource={assignedTasks}
              rowKey="id"
              loading={loadingAssigned}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
              size="small"
            />
          </div>
          <div>
            <h4 style={{ color: '#8e24aa', marginBottom: '8px' }}> Subtasks ({assignedSubTasks.length})</h4>
            <Table
              columns={subTaskColumns}
              dataSource={assignedSubTasks}
              rowKey="id"
              loading={loadingAssignedSubTasks}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
              size="small"
            />
          </div>
        </div>
      ),
    },
    {
      key: 'created',
      label: (
        <span>
          <PlusOutlined style={{ marginRight: 8 }} />
          Created Tasks ({createdTasks.length})
        </span>
      ),
      children: (
        <Table
          columns={columns}
          dataSource={createdTasks}
          rowKey="id"
          loading={loadingCreated}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
          size="small"
        />
      ),
    },
    {
      key: 'archived',
      label: (
        <span>
          <CheckCircleOutlined style={{ marginRight: 8 }} />
          Archived Tasks
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontWeight: 500 }}>Select project:</span>
            <Select
              style={{ width: '100%', maxWidth: 300 }}
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              placeholder="Select a project"
            >
              {assignedProjects.map(p => (
                <Select.Option key={p.id} value={p.id}>
                  {p.title}
                </Select.Option>
              ))}
            </Select>
          </div>
          <Table
            columns={columns}
            dataSource={archivedTasks}
            rowKey="id"
            loading={archivedLoading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
            size="small"
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px' }}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16, width: '100%', maxWidth: 200 }}
        onClick={() => setShowModal(true)}
        disabled={!hasProjects}
      >
        Create Task
      </Button>
      <Tabs defaultActiveKey="assigned" items={tabItems} />
      <CreateTaskModal open={showModal} onCancel={() => setShowModal(false)} onSuccess={handleSuccess} />
      <EditTaskModal open={editModalOpen} onCancel={() => setEditModalOpen(false)} onSuccess={handleSuccess} task={editTask} />
    </div>
  );
};

export default TaskUser;
