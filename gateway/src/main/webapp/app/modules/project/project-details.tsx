import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Table, Avatar, Space, message, Spin, Typography, Divider } from 'antd';
import {
  ArrowLeftOutlined,
  TeamOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  StarFilled,
  UserAddOutlined,
} from '@ant-design/icons';
import { ProjectDTO, UserDTO } from 'app/rest/dto';
import ProjectClientApi from 'app/rest/ProjectClientApi';
import EditProjectModal from './edit-project-modal';
import DeleteProjectModal from './delete-project-modal';
import AssignUsersModal from './assign-users-modal';
import { useAppSelector } from 'app/config/store';
import './project-modal.scss';

const { Title, Text } = Typography;

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [assignedUsers, setAssignedUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [assignUsersModalVisible, setAssignUsersModalVisible] = useState(false);
  const accountLogin = useAppSelector(state => state.authentication.account?.login);

  const loadProjectDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await ProjectClientApi.getProject(parseInt(id, 10));
      setProject(response.data);
    } catch (error) {
      console.error('Error al cargar detalles del proyecto:', error);
      message.error('Error al cargar detalles del proyecto');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedUsers = async () => {
    if (!id) return;

    setLoadingUsers(true);
    try {
      const response = await ProjectClientApi.getAssignedUsers(parseInt(id, 10));
      setAssignedUsers(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios asignados:', error);
      message.error('Error al cargar usuarios asignados');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadProjectDetails();
    loadAssignedUsers();
  }, [id]);

  const handleEditProject = () => {
    if (!project) return;

    // Convertir ProjectDTO a MinimalProjectDTO para la edición
    const minimalProject = {
      id: project.id,
      title: project.title,
      description: project.description,
      creatorId: project.creator?.login || '',
      workGroupId: project.workGroup?.id || 0,
    };
    setEditModalVisible(true);
  };

  const handleDeleteProject = () => {
    if (!project) return;

    // Convertir ProjectDTO a MinimalProjectDTO para la eliminación
    const minimalProject = {
      id: project.id,
      title: project.title,
      description: project.description,
      creatorId: project.creator?.login || '',
      workGroupId: project.workGroup?.id || 0,
    };
    setDeleteModalVisible(true);
  };

  const handleEditSuccess = () => {
    loadProjectDetails();
  };

  const handleDeleteSuccess = () => {
    message.success('Proyecto eliminado exitosamente');
    navigate('/project');
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
  };

  const handleAssignUsers = () => {
    setAssignUsersModalVisible(true);
  };

  const handleAssignUsersSuccess = () => {
    loadAssignedUsers();
  };

  const handleAssignUsersCancel = () => {
    setAssignUsersModalVisible(false);
  };

  const userColumns = [
    {
      title: 'Usuario',
      key: 'user',
      render(_: any, record: UserDTO) {
        const isCurrentUser = record.login === accountLogin;
        return (
          <Space>
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: isCurrentUser ? '#fadb14' : '#1890ff', color: isCurrentUser ? '#222' : undefined }}
            />
            <div>
              <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                {record.firstName && record.lastName ? `${record.firstName} ${record.lastName}` : record.login}
                {isCurrentUser && <StarFilled style={{ color: '#fadb14', marginLeft: 6 }} title="Tú" />}
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>@{record.login}</div>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => email || 'No disponible',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Proyecto no encontrado</Title>
        <Button type="primary" onClick={() => navigate('/project')}>
          Volver a Proyectos
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/project')} style={{ marginBottom: '16px' }}>
          Volver a Proyectos
        </Button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
              {project.title}
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Proyecto en {project.workGroup?.name}
            </Text>
          </div>

          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={handleEditProject}>
              Editar
            </Button>
            <Button icon={<UserAddOutlined />} onClick={handleAssignUsers}>
              Asignar Usuarios
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDeleteProject}>
              Eliminar
            </Button>
          </Space>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Detalles del Proyecto */}
        <Card title="Detalles del Proyecto" style={{ height: 'fit-content' }}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Título">
              <Text strong>{project.title}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Descripción">
              <Text>{project.description || 'Sin descripción'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Creador">
              <Tag color="blue">@{project.creator?.login}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Grupo de Trabajo">
              <Tag color="purple" style={{ fontWeight: 500 }}>
                {project.workGroup?.name}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Miembros Asignados">
              <Tag color="green" icon={<TeamOutlined />}>
                {assignedUsers.length} usuarios
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Usuarios Asignados */}
        <Card
          title={
            <span>
              <TeamOutlined style={{ marginRight: 8 }} />
              Usuarios Asignados ({assignedUsers.length})
            </span>
          }
        >
          <Table
            dataSource={assignedUsers}
            columns={userColumns}
            loading={loadingUsers}
            pagination={false}
            rowKey="id"
            size="small"
            locale={{
              emptyText: 'No hay usuarios asignados a este proyecto',
            }}
          />
        </Card>
      </div>

      {/* Modales */}
      <EditProjectModal
        visible={editModalVisible}
        project={
          project
            ? {
                id: project.id,
                title: project.title,
                description: project.description,
                creatorId: project.creator?.login || '',
                workGroupId: project.workGroup?.id || 0,
              }
            : null
        }
        onCancel={handleEditCancel}
        onSuccess={handleEditSuccess}
      />

      <DeleteProjectModal
        visible={deleteModalVisible}
        project={
          project
            ? {
                id: project.id,
                title: project.title,
                description: project.description,
                creatorId: project.creator?.login || '',
                workGroupId: project.workGroup?.id || 0,
              }
            : null
        }
        onCancel={handleDeleteCancel}
        onSuccess={handleDeleteSuccess}
      />

      <AssignUsersModal
        visible={assignUsersModalVisible}
        projectId={project?.id || 0}
        projectTitle={project?.title || ''}
        onCancel={handleAssignUsersCancel}
        onSuccess={handleAssignUsersSuccess}
      />
    </div>
  );
};

export default ProjectDetails;
