import React, { useEffect, useState } from 'react';
import { Tabs, Table, Tag, Space, Button, Popconfirm, message, Select } from 'antd';
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
          >
            Ver detalles
          </Button>
          {record.creatorLogin === currentUser && !record.archived && (
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
          {!record.archived && (
            <Popconfirm
              title="¿Seguro que deseas archivar esta tarea?"
              okText="Sí"
              cancelText="No"
              onConfirm={async () => {
                if (!record.id) return message.error('ID de tarea no válido');
                try {
                  await taskClientApi.archiveTask(record.id);
                  message.success('Tarea archivada correctamente');
                  handleSuccess();
                } catch (err: any) {
                  message.error(err.response?.data?.detail || err.message || 'Error al archivar la tarea');
                }
              }}
            >
              <Button type="link" style={{ color: '#8e24aa' }}>
                Archivar
              </Button>
            </Popconfirm>
          )}
          {record.archived && (
            <Popconfirm
              title="¿Seguro que deseas desarchivar esta tarea?"
              okText="Sí"
              cancelText="No"
              onConfirm={async () => {
                if (!record.id || !selectedProjectId) return message.error('ID de tarea o proyecto no válido');
                try {
                  await taskClientApi.unarchiveTask(record.id);
                  message.success('Tarea desarchivada correctamente');
                  setArchivedLoading(true);
                  taskClientApi
                    .getArchivedTasksByProject(selectedProjectId)
                    .then(r => setArchivedTasks(r.data))
                    .finally(() => setArchivedLoading(false));
                  handleSuccess();
                } catch (err: any) {
                  message.error(err.response?.data?.detail || err.message || 'Error al desarchivar la tarea');
                }
              }}
            >
              <Button type="link" style={{ color: '#1976d2' }}>
                Desarchivar
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="¿Seguro que deseas eliminar esta tarea?"
            okText="Sí"
            cancelText="No"
            onConfirm={async () => {
              if (!record.id) return message.error('ID de tarea no válido');
              try {
                await taskClientApi.deleteTask(record.id);
                message.success('Tarea eliminada correctamente');
                if (record.archived && selectedProjectId) {
                  setArchivedLoading(true);
                  taskClientApi
                    .getArchivedTasksByProject(selectedProjectId)
                    .then(r => setArchivedTasks(r.data))
                    .finally(() => setArchivedLoading(false));
                }
                handleSuccess();
              } catch (err: any) {
                message.error(err.response?.data?.detail || err.message || 'Error al eliminar la tarea');
              }
            }}
          >
            <Button type="link" danger>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const subTaskColumns = [
    {
      title: 'Título',
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
          >
            Ver detalles
          </Button>
          {record.creatorLogin === currentUser && !record.archived && (
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
          {!record.archived && (
            <Popconfirm
              title="¿Seguro que deseas archivar esta subtarea?"
              okText="Sí"
              cancelText="No"
              onConfirm={async () => {
                if (!record.id) return message.error('ID de subtarea no válido');
                try {
                  await taskClientApi.archiveTask(record.id);
                  message.success('Subtarea archivada correctamente');
                  handleSuccess();
                } catch (err: any) {
                  message.error(err.response?.data?.detail || err.message || 'Error al archivar la subtarea');
                }
              }}
            >
              <Button type="link" style={{ color: '#8e24aa' }}>
                Archivar
              </Button>
            </Popconfirm>
          )}
          {record.archived && (
            <Popconfirm
              title="¿Seguro que deseas desarchivar esta subtarea?"
              okText="Sí"
              cancelText="No"
              onConfirm={async () => {
                if (!record.id || !selectedProjectId) return message.error('ID de subtarea o proyecto no válido');
                try {
                  await taskClientApi.unarchiveTask(record.id);
                  message.success('Subtarea desarchivada correctamente');
                  setArchivedLoading(true);
                  taskClientApi
                    .getArchivedTasksByProject(selectedProjectId)
                    .then(r => setArchivedTasks(r.data))
                    .finally(() => setArchivedLoading(false));
                  handleSuccess();
                } catch (err: any) {
                  message.error(err.response?.data?.detail || err.message || 'Error al desarchivar la subtarea');
                }
              }}
            >
              <Button type="link" style={{ color: '#1976d2' }}>
                Desarchivar
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="¿Seguro que deseas eliminar esta subtarea?"
            okText="Sí"
            cancelText="No"
            onConfirm={async () => {
              if (!record.id) return message.error('ID de subtarea no válido');
              try {
                await taskClientApi.deleteTask(record.id);
                message.success('Subtarea eliminada correctamente');
                if (record.archived && selectedProjectId) {
                  setArchivedLoading(true);
                  taskClientApi
                    .getArchivedTasksByProject(selectedProjectId)
                    .then(r => setArchivedTasks(r.data))
                    .finally(() => setArchivedLoading(false));
                }
                handleSuccess();
              } catch (err: any) {
                message.error(err.response?.data?.detail || err.message || 'Error al eliminar la subtarea');
              }
            }}
          >
            <Button type="link" danger>
              Eliminar
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
          Tareas asignadas ({assignedTasks.length + assignedSubTasks.length})
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ color: '#1f2937', marginBottom: '8px' }}> Tareas Principales ({assignedTasks.length})</h4>
            <Table columns={columns} dataSource={assignedTasks} rowKey="id" loading={loadingAssigned} pagination={{ pageSize: 10 }} />
          </div>
          <div>
            <h4 style={{ color: '#8e24aa', marginBottom: '8px' }}> Subtareas ({assignedSubTasks.length})</h4>
            <Table
              columns={subTaskColumns}
              dataSource={assignedSubTasks}
              rowKey="id"
              loading={loadingAssignedSubTasks}
              pagination={{ pageSize: 10 }}
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
