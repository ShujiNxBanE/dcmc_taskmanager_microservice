// modules/work-group/work-group-admin.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, message, Tabs, Button, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import WorkGroupClientApi from 'app/rest/WorkGroupClientApi';
import { WorkGroupDTO, UserGroupViewDTO } from 'app/rest/dto';
import CreateWorkGroupModal from './create-work-group-modal';
import EditWorkGroupModal from './edit-work-group-modal';
import './work-group-modal.scss';

const WorkGroupAdmin = () => {
  const navigate = useNavigate();
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
    if (id === undefined) return;
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
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: WorkGroupDTO) => (
        <Space size="small">
          <Button
            type="text"
            icon={<TeamOutlined />}
            onClick={() => navigate(`/work-group/members/${record.id}/${encodeURIComponent(record.name)}`)}
            style={{ color: '#10b981' }}
            title="View members"
          />
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ color: '#3b82f6' }} />
          <Popconfirm
            title="Are you sure you want to delete this group?"
            description="This action cannot be undone."
            onConfirm={() => record.id !== undefined && handleDelete(record.id)}
            okText="Yes, delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" icon={<DeleteOutlined />} style={{ color: '#ef4444' }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const myColumns = [
    { title: 'Name', dataIndex: 'groupName', key: 'groupName' },
    { title: 'Description', dataIndex: 'groupDescription', key: 'groupDescription' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: UserGroupViewDTO) => (
        <Space size="small">
          <Button
            type="text"
            icon={<TeamOutlined />}
            onClick={() => navigate(`/work-group/members/${record.groupId}/${encodeURIComponent(record.groupName)}`)}
            style={{ color: '#10b981' }}
            title="View members"
          />
          {isOwner(record) && (
            <>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() =>
                  handleEdit({
                    id: record.groupId,
                    name: record.groupName,
                    description: record.groupDescription,
                    isActive: record.isActive,
                  })
                }
                style={{ color: '#3b82f6' }}
              />
              <Popconfirm
                title="Are you sure you want to delete this group?"
                description="This action cannot be undone."
                onConfirm={() => record.groupId !== undefined && handleDelete(record.groupId)}
                okText="Yes, delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button type="text" icon={<DeleteOutlined />} style={{ color: '#ef4444' }} />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'all',
      label: 'All Groups',
      children: (
        <div className="work-group-tables">
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)} className="create-group-button">
              Create Group
            </Button>
          </div>
          <Table rowKey="id" dataSource={allWorkGroups} columns={allColumns} loading={loadingAll} scroll={{ x: 'max-content' }} />
        </div>
      ),
    },
    {
      key: 'my',
      label: 'My Groups',
      children: (
        <div className="work-group-tables">
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)} className="create-group-button">
              Create Group
            </Button>
          </div>
          <Table rowKey="groupId" dataSource={myWorkGroups} columns={myColumns} loading={loadingMy} scroll={{ x: 'max-content' }} />
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
