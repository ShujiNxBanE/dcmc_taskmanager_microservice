import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectDTO, MinimalProjectDTO } from 'app/rest/dto';
import ProjectClientApi from 'app/rest/ProjectClientApi';
import { message, Table, Button, Space, Tabs, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import CreateProjectModal from './create-project-modal';
import EditProjectModal from './edit-project-modal';
import './project-modal.scss';

const ProjectUser = () => {
  const navigate = useNavigate();
  const [assignedProjects, setAssignedProjects] = useState<ProjectDTO[]>([]);
  const [myCreatedProjects, setMyCreatedProjects] = useState<MinimalProjectDTO[]>([]);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [loadingCreated, setLoadingCreated] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<MinimalProjectDTO | null>(null);

  const loadAssignedProjects = async () => {
    setLoadingAssigned(true);
    try {
      const response = await ProjectClientApi.getAssignedProjects();
      setAssignedProjects(response.data);
    } catch (error) {
      console.error('Error al cargar proyectos asignados:', error);
      message.error('Error al cargar proyectos asignados');
    } finally {
      setLoadingAssigned(false);
    }
  };

  const loadMyCreatedProjects = async () => {
    setLoadingCreated(true);
    try {
      const response = await ProjectClientApi.getMyCreatedProjects();
      setMyCreatedProjects(response.data);
    } catch (error) {
      console.error('Error al cargar mis proyectos creados:', error);
      message.error('Error al cargar mis proyectos creados');
    } finally {
      setLoadingCreated(false);
    }
  };

  useEffect(() => {
    loadAssignedProjects();
    loadMyCreatedProjects();
  }, []);

  const assignedColumns = [
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
        <div style={{ color: '#6b7280', maxWidth: 300 }}>{text.length > 100 ? `${text.substring(0, 100)}...` : text}</div>
      ),
    },
    {
      title: 'Grupo de Trabajo',
      key: 'workGroup',
      render: (_: any, record: ProjectDTO) => (
        <Tag color="purple" style={{ fontWeight: 500 }}>
          {record.workGroup?.name || `Grupo ${record.workGroup?.id}`}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: ProjectDTO) => (
        <Space size="small">
          <Button
            type="text"
            icon={<TeamOutlined />}
            onClick={() => navigate(`/project/${record.id}`)}
            style={{ color: '#10b981' }}
            title="Ver detalles"
          >
            Ver
          </Button>
        </Space>
      ),
    },
  ];

  const createdColumns = [
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
        <div style={{ color: '#6b7280', maxWidth: 300 }}>{text.length > 100 ? `${text.substring(0, 100)}...` : text}</div>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: MinimalProjectDTO) => (
        <Space size="small">
          <Button
            type="text"
            icon={<TeamOutlined />}
            onClick={() => navigate(`/project/${record.id}`)}
            style={{ color: '#10b981' }}
            title="Ver detalles"
          >
            Ver
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            style={{ color: '#3b82f6' }}
            title="Editar proyecto"
            onClick={() => handleEditProject(record)}
          />
          <Button type="text" icon={<DeleteOutlined />} style={{ color: '#ef4444' }} title="Eliminar proyecto" />
        </Space>
      ),
    },
  ];

  const handleCreateProject = () => {
    setCreateModalVisible(true);
  };

  const handleEditProject = (project: MinimalProjectDTO) => {
    setSelectedProject(project);
    setEditModalVisible(true);
  };

  const handleCreateSuccess = () => {
    // Recargar todos los datos después de crear un proyecto
    loadAssignedProjects();
    loadMyCreatedProjects();
  };

  const handleEditSuccess = () => {
    // Recargar todos los datos después de editar un proyecto
    loadAssignedProjects();
    loadMyCreatedProjects();
  };

  const handleCreateCancel = () => {
    setCreateModalVisible(false);
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    setSelectedProject(null);
  };

  const tabItems = [
    {
      key: 'assigned',
      label: (
        <span>
          <UserOutlined style={{ marginRight: 8 }} />
          Proyectos Asignados ({assignedProjects.length})
        </span>
      ),
      children: (
        <div className="project-tables">
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<PlusOutlined />} className="create-project-button" onClick={handleCreateProject}>
              Crear Proyecto
            </Button>
          </div>
          <Table
            rowKey="id"
            dataSource={assignedProjects}
            columns={assignedColumns}
            loading={loadingAssigned}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} proyectos`,
            }}
          />
        </div>
      ),
    },
    {
      key: 'created',
      label: (
        <span>
          <PlusOutlined style={{ marginRight: 8 }} />
          Mis Proyectos Creados ({myCreatedProjects.length})
        </span>
      ),
      children: (
        <div className="project-tables">
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<PlusOutlined />} className="create-project-button" onClick={handleCreateProject}>
              Crear Proyecto
            </Button>
          </div>
          <Table
            rowKey="id"
            dataSource={myCreatedProjects}
            columns={createdColumns}
            loading={loadingCreated}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} proyectos`,
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="project-container">
      <Tabs items={tabItems} />
      <CreateProjectModal visible={createModalVisible} onCancel={handleCreateCancel} onSuccess={handleCreateSuccess} />
      <EditProjectModal visible={editModalVisible} project={selectedProject} onCancel={handleEditCancel} onSuccess={handleEditSuccess} />
    </div>
  );
};

export default ProjectUser;
