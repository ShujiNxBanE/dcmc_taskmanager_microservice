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
  UserDeleteOutlined,
} from '@ant-design/icons';
import { ProjectDTO, UserDTO } from 'app/rest/dto';
import ProjectClientApi from 'app/rest/ProjectClientApi';
import EditProjectModal from './edit-project-modal';
import DeleteProjectModal from './delete-project-modal';
import AssignUsersModal from './assign-users-modal';
import UnassignUserModal from './unassign-user-modal';
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
  const [unassignUserModalVisible, setUnassignUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
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

  const handleUnassignUser = (user: UserDTO) => {
    setSelectedUser(user);
    setUnassignUserModalVisible(true);
  };

  const handleUnassignUserSuccess = () => {
    loadAssignedUsers();
  };

  const handleUnassignUserCancel = () => {
    setUnassignUserModalVisible(false);
    setSelectedUser(null);
  };

  // Verificar si el usuario actual es el creador del proyecto
  const isProjectCreator = project?.creator?.login === accountLogin;

  const userColumns = [
    {
      title: 'User',
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
                {isCurrentUser && <StarFilled style={{ color: '#fadb14', marginLeft: 6 }} title="You" />}
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>@{record.login}</div>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render(_: any, record: UserDTO) {
        // Solo mostrar botón de desasignar si el usuario actual es el creador del proyecto
        if (!isProjectCreator) {
          return <span style={{ color: '#999' }}>No permissions</span>;
        }

        return (
          <Button
            type="text"
            icon={<UserDeleteOutlined />}
            style={{ color: '#ef4444' }}
            title="Unassign user"
            onClick={() => handleUnassignUser(record)}
          >
            Unassign
          </Button>
        );
      },
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
        <Title level={3}>Project not found</Title>
        <Button type="primary" onClick={() => navigate('/project')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/project')} style={{ marginBottom: '16px' }}>
          Back to Projects
        </Button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
              {project.title}
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Project in {project.workGroup?.name}
            </Text>
          </div>

          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={handleEditProject}>
              Edit
            </Button>
            {isProjectCreator && (
              <Button icon={<UserAddOutlined />} onClick={handleAssignUsers}>
                Assign Users
              </Button>
            )}
            <Button danger icon={<DeleteOutlined />} onClick={handleDeleteProject}>
              Delete
            </Button>
          </Space>
        </div>
      </div>

      <div className="project-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Project Details */}
        <Card title="Project Details" style={{ height: 'fit-content' }}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Title">
              <Text strong>{project.title}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              <Text>{project.description || 'No description'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Creator">
              <Tag color="blue">@{project.creator?.login}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Work Group">
              <Tag color="purple" style={{ fontWeight: 500 }}>
                {project.workGroup?.name}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Assigned Members">
              <Tag color="green" icon={<TeamOutlined />}>
                {assignedUsers.length} users
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Assigned Users */}
        <Card
          title={
            <span>
              <TeamOutlined style={{ marginRight: 8 }} />
              Assigned Users ({assignedUsers.length})
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
              emptyText: 'No users assigned to this project',
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

      <UnassignUserModal
        visible={unassignUserModalVisible}
        projectId={project?.id || 0}
        projectTitle={project?.title || ''}
        user={selectedUser}
        onCancel={handleUnassignUserCancel}
        onSuccess={handleUnassignUserSuccess}
      />
    </div>
  );
};

export default ProjectDetails;
