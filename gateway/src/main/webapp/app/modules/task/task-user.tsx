import React, { useEffect, useState } from 'react';
import { Tabs, Table, Tag, Space, Button, Popconfirm, message, Select } from 'antd';
import { TaskSimpleDTO } from 'app/rest/dto';
import taskClientApi from 'app/rest/TaskClientApi';
import { UserOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
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
  const [archivedTasks, setArchivedTasks] = useState<TaskSimpleDTO[]>([]);
  const [archivedLoading, setArchivedLoading] = useState(false);
  const [assignedProjects, setAssignedProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadAssignedTasks();
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
            <>
              <Button
                type="link"
                onClick={() => {
                  setEditTask(record);
                  setEditModalOpen(true);
                }}
              >
                Editar
              </Button>
              <Popconfirm
                title="¿Seguro que deseas eliminar esta tarea?"
                okText="Sí"
                cancelText="No"
                onConfirm={async () => {
                  if (!record.id) return message.error('ID de tarea no válido');
                  try {
                    await taskClientApi.deleteTask(record.id);
                    message.success('Tarea eliminada correctamente');
                    handleSuccess();
                  } catch (err: any) {
                    message.error(err.message || 'Error al eliminar la tarea');
                  }
                }}
              >
                <Button type="link" danger>
                  Eliminar
                </Button>
              </Popconfirm>
            </>
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
    {
      key: 'archived',
      label: (
        <span>
          <CheckCircleOutlined style={{ marginRight: 8 }} />
          Tareas archivadas
        </span>
      ),
      children: (
        <div>
          <span style={{ marginRight: 8, fontWeight: 500 }}>Escoger proyecto:</span>
          <Select
            style={{ width: 300, marginBottom: 16 }}
            value={selectedProjectId}
            onChange={setSelectedProjectId}
            placeholder="Selecciona un proyecto"
          >
            {assignedProjects.map(p => (
              <Select.Option key={p.id} value={p.id}>
                {p.title}
              </Select.Option>
            ))}
          </Select>
          <Table columns={columns} dataSource={archivedTasks} rowKey="id" loading={archivedLoading} pagination={{ pageSize: 10 }} />
        </div>
      ),
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
