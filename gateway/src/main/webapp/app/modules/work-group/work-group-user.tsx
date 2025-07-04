// modules/work-group/work-group-user.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkGroupDTO, UserGroupViewDTO } from 'app/rest/dto';
import WorkGroupClientApi from 'app/rest/WorkGroupClientApi';
import { message, Table, Button, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import CreateWorkGroupModal from './create-work-group-modal';
import EditWorkGroupModal from './edit-work-group-modal';
import './work-group-modal.scss';

const WorkGroupUser = () => {
  const navigate = useNavigate();
  const [workGroups, setWorkGroups] = useState<UserGroupViewDTO[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedWorkGroup, setSelectedWorkGroup] = useState<WorkGroupDTO | null>(null);

  const loadWorkGroups = async () => {
    try {
      const response = await WorkGroupClientApi.getMyActiveGroups();
      setWorkGroups(response.data);
    } catch (error) {
      console.error('Error al cargar mis grupos de trabajo:', error);
      message.error('Error al cargar mis grupos de trabajo');
    }
  };

  const handleCreateSuccess = () => {
    loadWorkGroups();
  };

  const handleEditSuccess = () => {
    loadWorkGroups();
  };

  const handleEdit = (record: UserGroupViewDTO) => {
    // Convertir UserGroupViewDTO a WorkGroupDTO para el modal
    const workGroupData: WorkGroupDTO = {
      id: record.groupId,
      name: record.groupName,
      description: record.groupDescription,
      isActive: record.isActive,
    };
    setSelectedWorkGroup(workGroupData);
    setEditModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (id === undefined) return;
    try {
      await WorkGroupClientApi.deleteWorkGroup(id);
      message.success('Grupo de trabajo eliminado exitosamente');
      loadWorkGroups();
    } catch (error) {
      console.error('Error al eliminar el grupo de trabajo:', error);
      message.error('Error al eliminar el grupo de trabajo');
    }
  };

  const isOwner = (record: UserGroupViewDTO) => {
    // Verificar si el usuario es propietario del grupo
    // Asumiendo que el rol "OWNER" o "ADMIN" indica propiedad
    return record.role === 'OWNER' || record.role === 'ADMIN' || record.role === 'PROPIETARIO';
  };

  useEffect(() => {
    loadWorkGroups();
  }, []);

  const columns = [
    { title: 'Name', dataIndex: 'groupName', key: 'groupName' },
    { title: 'Description', dataIndex: 'groupDescription', key: 'groupDescription' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    {
      title: 'Actions',
      key: 'actions',
      render(_: any, record: UserGroupViewDTO) {
        return (
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
                <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ color: '#3b82f6' }} />
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
        );
      },
    },
  ];

  return (
    <div className="work-group-container">
      <div className="work-group-tables">
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)} className="create-group-button">
            Create Group
          </Button>
        </div>
        <Table rowKey="groupId" dataSource={workGroups} columns={columns} scroll={{ x: 'max-content' }} />
      </div>
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

export default WorkGroupUser;
