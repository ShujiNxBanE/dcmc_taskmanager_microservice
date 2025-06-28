// modules/work-group/work-group-admin.tsx

import React, { useEffect, useState } from 'react';
import { Table, message, Tabs, Button, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import WorkGroupClientApi from 'app/rest/WorkGroupClientApi';
import { WorkGroupDTO, UserGroupViewDTO } from 'app/rest/dto';
import CreateWorkGroupModal from './create-work-group-modal';
import EditWorkGroupModal from './edit-work-group-modal';
import './work-group-modal.scss';

const WorkGroupAdmin = () => {
  const [allWorkGroups, setAllWorkGroups] = useState<WorkGroupDTO[]>([]);
  const [myWorkGroups, setMyWorkGroups] = useState<UserGroupViewDTO[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingMy, setLoadingMy] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedWorkGroup, setSelectedWorkGroup] = useState<WorkGroupDTO | null>(null);

  const loadAllWorkGroups = async () => {
    setLoadingAll(true);
    try {
      const response = await WorkGroupClientApi.getAllWorkGroups();
      setAllWorkGroups(response.data);
    } catch (err) {
      console.error('Error al cargar todos los grupos de trabajo:', err);
      message.error('Error al cargar todos los grupos de trabajo');
    } finally {
      setLoadingAll(false);
    }
  };

  const loadMyWorkGroups = async () => {
    setLoadingMy(true);
    try {
      const response = await WorkGroupClientApi.getMyActiveGroups();
      setMyWorkGroups(response.data);
    } catch (err) {
      console.error('Error al cargar mis grupos de trabajo:', err);
      message.error('Error al cargar mis grupos de trabajo');
    } finally {
      setLoadingMy(false);
    }
  };

  const handleCreateSuccess = () => {
    loadAllWorkGroups();
    loadMyWorkGroups();
  };

  const handleEditSuccess = () => {
    loadAllWorkGroups();
    loadMyWorkGroups();
  };

  const handleEdit = (record: WorkGroupDTO) => {
    setSelectedWorkGroup(record);
    setEditModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await WorkGroupClientApi.deleteWorkGroup(id);
      message.success('Grupo de trabajo eliminado exitosamente');
      loadAllWorkGroups();
      loadMyWorkGroups();
    } catch (error) {
      console.error('Error al eliminar el grupo de trabajo:', error);
      message.error('Error al eliminar el grupo de trabajo');
    }
  };

  useEffect(() => {
    loadAllWorkGroups();
    loadMyWorkGroups();
  }, []);

  const isOwner = (record: UserGroupViewDTO) => {
    return record.role === 'OWNER' || record.role === 'ADMIN' || record.role === 'PROPIETARIO';
  };

  const allColumns = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Descripción', dataIndex: 'description', key: 'description' },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: WorkGroupDTO) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ color: '#3b82f6' }} />
          <Popconfirm
            title="¿Estás seguro de que quieres eliminar este grupo?"
            description="Esta acción no se puede deshacer."
            onConfirm={() => handleDelete(record.id)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" icon={<DeleteOutlined />} style={{ color: '#ef4444' }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const myColumns = [
    { title: 'Nombre', dataIndex: 'groupName', key: 'groupName' },
    { title: 'Descripción', dataIndex: 'groupDescription', key: 'groupDescription' },
    { title: 'Rol', dataIndex: 'role', key: 'role' },
  ];

  const tabItems = [
    {
      key: 'all',
      label: 'Todos los Grupos',
      children: (
        <div className="work-group-tables">
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)} className="create-group-button">
              Crear Grupo
            </Button>
          </div>
          <Table rowKey="id" dataSource={allWorkGroups} columns={allColumns} loading={loadingAll} />
        </div>
      ),
    },
    {
      key: 'my',
      label: 'Mis Grupos',
      children: (
        <div className="work-group-tables">
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)} className="create-group-button">
              Crear Grupo
            </Button>
          </div>
          <Table rowKey="groupId" dataSource={myWorkGroups} columns={myColumns} loading={loadingMy} />
        </div>
      ),
    },
  ];

  return (
    <div className="work-group-container">
      <Tabs items={tabItems} />
      <CreateWorkGroupModal visible={modalVisible} onCancel={() => setModalVisible(false)} onSuccess={handleCreateSuccess} />
      <EditWorkGroupModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
        workGroup={selectedWorkGroup}
      />
    </div>
  );
};

export default WorkGroupAdmin;
