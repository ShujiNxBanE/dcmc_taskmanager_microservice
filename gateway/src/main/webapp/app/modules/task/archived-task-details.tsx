import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Table, Spin, message } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { TaskSimpleDTO, UserDTO } from 'app/rest/dto';
import taskClientApi from 'app/rest/TaskClientApi';

const ArchivedTaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskSimpleDTO | null>(null);
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

        <Card title="Detalles de la Tarea Archivada">
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
              <Tag color="red">Sí</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>

      <Card title={`Subtareas (${subTasks.length})`}>
        <Table
          columns={subTaskColumns}
          dataSource={subTasks}
          rowKey="id"
          loading={subTasksLoading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No hay subtareas para esta tarea' }}
        />
      </Card>

      <Card title={`Usuarios Asignados (${assignedUsers.length})`} style={{ marginTop: '16px' }}>
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
          ]}
          dataSource={assignedUsers}
          rowKey="id"
          loading={assignedUsersLoading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No hay usuarios asignados a esta tarea' }}
        />
      </Card>
    </div>
  );
};

export default ArchivedTaskDetails;
