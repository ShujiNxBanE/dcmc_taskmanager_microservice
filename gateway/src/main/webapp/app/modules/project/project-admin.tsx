import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectDTO, MinimalProjectDTO } from 'app/rest/dto';
import ProjectClientApi from 'app/rest/ProjectClientApi';
import { message, Table, Button, Space, Tabs, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, UserOutlined, GlobalOutlined } from '@ant-design/icons';
import './project-modal.scss';

const ProjectAdmin = () => {
  const navigate = useNavigate();
  const [allProjects, setAllProjects] = useState<ProjectDTO[]>([]);
  const [assignedProjects, setAssignedProjects] = useState<ProjectDTO[]>([]);
  const [myCreatedProjects, setMyCreatedProjects] = useState<MinimalProjectDTO[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [loadingCreated, setLoadingCreated] = useState(false);

  const loadAllProjects = async () => {
    setLoadingAll(true);
    try {
      const response = await ProjectClientApi.getAllActiveProjects();
      setAllProjects(response.data);
    } catch (err) {
      console.error('Error al cargar todos los proyectos:', err);
      message.error('Error al cargar todos los proyectos');
    } finally {
      setLoadingAll(false);
    }
  };

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
    loadAllProjects();
    loadAssignedProjects();
    loadMyCreatedProjects();
  }, []);

  const allColumns = [
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
      title: 'Creador',
      key: 'creator',
      render: (_: any, record: ProjectDTO) => <Tag color="blue">@{record.creator?.login}</Tag>,
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
          <Button type="text" icon={<EditOutlined />} style={{ color: '#3b82f6' }} title="Editar proyecto" />
          <Button type="text" icon={<DeleteOutlined />} style={{ color: '#ef4444' }} title="Eliminar proyecto" />
        </Space>
      ),
    },
  ];

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
            onClick={() => navigate(`/project/${record.workGroupId}`)}
            style={{ color: '#10b981' }}
            title="Ver detalles"
          >
            Ver
          </Button>
          <Button type="text" icon={<EditOutlined />} style={{ color: '#3b82f6' }} title="Editar proyecto" />
          <Button type="text" icon={<DeleteOutlined />} style={{ color: '#ef4444' }} title="Eliminar proyecto" />
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          <GlobalOutlined style={{ marginRight: 8 }} />
          Todos los Proyectos ({allProjects.length})
        </span>
      ),
      children: (
        <div className="project-tables">
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<PlusOutlined />} className="create-project-button">
              Crear Proyecto
            </Button>
          </div>
          <Table
            rowKey="id"
            dataSource={allProjects}
            columns={allColumns}
            loading={loadingAll}
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
            <Button type="primary" icon={<PlusOutlined />} className="create-project-button">
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
            <Button type="primary" icon={<PlusOutlined />} className="create-project-button">
              Crear Proyecto
            </Button>
          </div>
          <Table
            rowKey="workGroupId"
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
    </div>
  );
};

export default ProjectAdmin;
