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
      message.error('Error al cargar los detalles de la tarea');
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
      message.error('Error al cargar las subtareas');
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
      message.error('Error al cargar los usuarios asignados');
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
      message.success('Tarea archivada correctamente');
      navigate(-1);
    } catch (error: any) {
      message.error('Error al archivar la tarea');
    }
  };

  const handleDelete = async () => {
    if (!task?.id) return;
    try {
      await taskClientApi.deleteTask(task.id);
      message.success('Tarea eliminada correctamente');
      navigate(-1);
    } catch (error: any) {
      message.error('Error al eliminar la tarea');
    }
  };

  const subTaskColumns = [
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
            Editar
          </Button>
          <Button type="link" onClick={() => navigate(`/task/subtask/${record.id}`)}>
            Ver detalles
          </Button>
          <Popconfirm
            title="¿Seguro que deseas eliminar esta subtarea?"
            okText="Sí"
            cancelText="No"
            onConfirm={async () => {
              if (!record.id) return message.error('ID de subtarea no válido');
              try {
                await taskClientApi.deleteTask(record.id);
                message.success('Subtarea eliminada correctamente');
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
        <h2>Tarea no encontrada</h2>
        <Button type="primary" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: '16px' }}>
          Volver
        </Button>

        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Detalles de la Tarea</span>
              <Space>
                {task.creatorLogin === currentUser && (
                  <Button type="primary" icon={<EditOutlined />} onClick={() => setEditModalOpen(true)}>
                    Editar
                  </Button>
                )}
                <Popconfirm title="¿Seguro que deseas archivar esta tarea?" okText="Sí" cancelText="No" onConfirm={handleArchive}>
                  <Button icon={<InboxOutlined />} style={{ color: '#8e24aa' }}>
                    Archivar
                  </Button>
                </Popconfirm>
                {(task.creatorLogin === currentUser || isOwnerOrModerator) && (
                  <Popconfirm title="¿Seguro que deseas eliminar esta tarea?" okText="Sí" cancelText="No" onConfirm={handleDelete}>
                    <Button danger icon={<DeleteOutlined />}>
                      Eliminar
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            </div>
          }
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Título" span={2}>
              <strong>{task.title}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Descripción" span={2}>
              {task.description || 'Sin descripción'}
            </Descriptions.Item>
            <Descriptions.Item label="Prioridad">
              <Tag color="red">{task.priorityName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag color="blue">{task.statusName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Creador">
              <Tag color="purple">@{task.creatorLogin}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Fecha de Creación">
              {task.createTime ? new Date(task.createTime).toLocaleString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Última Actualización">
              {task.updateTime ? new Date(task.updateTime).toLocaleString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Archivada">
              <Tag color={task.archived ? 'red' : 'green'}>{task.archived ? 'Sí' : 'No'}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>

      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Subtareas ({subTasks.length})</span>
            <Button type="primary" onClick={() => setCreateSubTaskModalOpen(true)}>
              Crear Subtarea
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
          locale={{ emptyText: 'No hay subtareas para esta tarea' }}
        />
      </Card>

      <Card
        title={`Usuarios Asignados (${assignedUsers.length})`}
        style={{ marginTop: '16px' }}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAssignUsersModalOpen(true)}
            disabled={!task?.projectId || !task?.workGroupId}
          >
            Asignar Usuarios
          </Button>
        }
      >
        <Table
          columns={[
            {
              title: 'Usuario',
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
              title: 'Acciones',
              key: 'acciones',
              render: (_: any, record: UserDTO) => (
                <Popconfirm
                  title="¿Seguro que deseas desasignar este usuario de la tarea?"
                  okText="Sí"
                  cancelText="No"
                  onConfirm={async () => {
                    if (!task?.workGroupId || !task?.id) return message.error('Faltan datos de la tarea');
                    try {
                      await taskClientApi.unassignUsersFromTask(task.workGroupId, task.id, [record.id.toString()]);
                      message.success('Usuario desasignado correctamente');
                      handleSuccess();
                    } catch (err: any) {
                      message.error(err.response?.data?.detail || err.message || 'Error al desasignar el usuario');
                    }
                  }}
                >
                  <Button type="link" danger>
                    Desasignar
                  </Button>
                </Popconfirm>
              ),
            },
          ]}
          dataSource={assignedUsers}
          rowKey="id"
          loading={assignedUsersLoading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No hay usuarios asignados a esta tarea' }}
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
