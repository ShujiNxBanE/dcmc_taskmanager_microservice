import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Table, Space, message, Spin, Popconfirm } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import { TaskSimpleDTO, TaskDetailsDTO, UserDTO } from 'app/rest/dto';
import taskClientApi from 'app/rest/TaskClientApi';
import projectClientApi from 'app/rest/ProjectClientApi';
import { useAppSelector } from 'app/config/store';
import AssignUsersModal from './assign-users-modal';
import CommentSection from './comment-section';

const SubTaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskDetailsDTO | null>(null);
  const [assignedUsers, setAssignedUsers] = useState<UserDTO[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignedUsersLoading, setAssignedUsersLoading] = useState(false);
  const [assignUsersModalOpen, setAssignUsersModalOpen] = useState(false);
  const currentUser = useAppSelector(state => state.authentication.account?.login);
  const authorities = useAppSelector(state => state.authentication.account?.authorities ?? []);

  useEffect(() => {
    if (id) {
      loadTaskDetails();
      loadAssignedUsers();
      loadProjectId();
    }
  }, [id]);

  const loadTaskDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await taskClientApi.getTaskDetails(parseInt(id, 10));
      setTask(response.data);
    } catch (error: any) {
      message.error('Error al cargar los detalles de la subtarea');
      console.error('Error loading subtask details:', error);
    } finally {
      setLoading(false);
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

  const loadProjectId = async () => {
    try {
      const response = await projectClientApi.getAssignedProjects();
      if (response.data.length > 0) {
        setProjectId(response.data[0].id);
      }
    } catch (error: any) {
      console.error('Error loading project ID:', error);
    }
  };

  const handleSuccess = () => {
    loadTaskDetails();
    loadAssignedUsers();
  };

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
        <h2>Subtarea no encontrada</h2>
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
              <span>Detalles de la Subtarea</span>
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
        title={`Usuarios Asignados (${assignedUsers.length})`}
        style={{ marginTop: '16px' }}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAssignUsersModalOpen(true)}
            disabled={!projectId || !task?.workGroupId}
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
                  title="¿Seguro que deseas desasignar este usuario de la subtarea?"
                  okText="Sí"
                  cancelText="No"
                  onConfirm={async () => {
                    if (!task?.workGroupId || !task?.id) return message.error('Faltan datos de la subtarea');
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
          locale={{ emptyText: 'No hay usuarios asignados a esta subtarea' }}
        />
      </Card>

      <AssignUsersModal
        open={assignUsersModalOpen}
        onCancel={() => setAssignUsersModalOpen(false)}
        onSuccess={handleSuccess}
        taskId={task?.id || 0}
        workGroupId={task?.workGroupId || 0}
        projectId={projectId || 0}
        currentAssignedUsers={assignedUsers}
      />

      <CommentSection
        taskId={task?.id || 0}
        projectId={task?.projectId || 0}
        workGroupId={task?.workGroupId || 0}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default SubTaskDetails;
