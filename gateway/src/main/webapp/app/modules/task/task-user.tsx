import React, { useEffect, useState } from 'react';
import { Tabs, Table, Tag, Space, Button } from 'antd';
import { TaskSimpleDTO } from 'app/rest/dto';
import taskClientApi from 'app/rest/TaskClientApi';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import projectClientApi from 'app/rest/ProjectClientApi';
import CreateTaskModal from './create-task-modal';
import { useAppSelector } from 'app/config/store';
import EditTaskModal from './edit-task-modal';

const TaskUser = () => {
  const [assignedTasks, setAssignedTasks] = useState<TaskSimpleDTO[]>([]);
  const [createdTasks, setCreatedTasks] = useState<TaskSimpleDTO[]>([]);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [loadingCreated, setLoadingCreated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasProjects, setHasProjects] = useState(false);
  const currentUser = useAppSelector(state => state.authentication.account?.login);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskSimpleDTO | null>(null);

  useEffect(() => {
    loadAssignedTasks();
    loadCreatedTasks();
    projectClientApi.getAssignedProjects().then(r => setHasProjects(r.data.length > 0));
  }, []);

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

  const handleSuccess = () => {
    loadAssignedTasks();
    loadCreatedTasks();
  };

  const columns = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <div style={{ fontWeight: 600, color: '#1f2937' }}>{text}</div>,
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <div style={{ color: '#6b7280', maxWidth: 300 }}>{text && text.length > 100 ? `${text.substring(0, 100)}...` : text}</div>
      ),
    },
    {
      title: 'Prioridad',
      dataIndex: 'priorityName',
      key: 'priorityName',
      render: (priority: string) => <Tag color="red">{priority}</Tag>,
    },
    {
      title: 'Estado',
      dataIndex: 'statusName',
      key: 'statusName',
      render: (status: string) => <Tag color="blue">{status}</Tag>,
    },
    {
      title: 'Creador',
      dataIndex: 'creatorLogin',
      key: 'creatorLogin',
      render: (login: string) => <Tag color="purple">@{login}</Tag>,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: TaskSimpleDTO) => (
        <Space size="small">
          {record.creatorLogin === currentUser && (
            <Button
              type="link"
              onClick={() => {
                setEditTask(record);
                setEditModalOpen(true);
              }}
            >
              Editar
            </Button>
          )}
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
          Tareas asignadas ({assignedTasks.length})
        </span>
      ),
      children: <Table columns={columns} dataSource={assignedTasks} rowKey="id" loading={loadingAssigned} pagination={{ pageSize: 10 }} />,
    },
    {
      key: 'created',
      label: (
        <span>
          <PlusOutlined style={{ marginRight: 8 }} />
          Tareas creadas ({createdTasks.length})
        </span>
      ),
      children: <Table columns={columns} dataSource={createdTasks} rowKey="id" loading={loadingCreated} pagination={{ pageSize: 10 }} />,
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => setShowModal(true)}
        disabled={!hasProjects}
      >
        Crear tarea
      </Button>
      <Tabs defaultActiveKey="assigned" items={tabItems} />
      <CreateTaskModal open={showModal} onCancel={() => setShowModal(false)} onSuccess={handleSuccess} />
      <EditTaskModal open={editModalOpen} onCancel={() => setEditModalOpen(false)} onSuccess={handleSuccess} task={editTask} />
    </div>
  );
};

export default TaskUser;
