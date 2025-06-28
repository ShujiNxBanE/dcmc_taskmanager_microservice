// modules/work-group/work-group-user.tsx

import React, { useEffect, useState } from 'react';
import { WorkGroupDTO, UserGroupViewDTO } from 'app/rest/dto';
import WorkGroupClientApi from 'app/rest/WorkGroupClientApi';
import { message, Table, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CreateWorkGroupModal from './create-work-group-modal';
import './work-group-modal.scss';

const WorkGroupUser = () => {
  const [workGroups, setWorkGroups] = useState<UserGroupViewDTO[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

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

  useEffect(() => {
    loadWorkGroups();
  }, []);

  const columns = [
    { title: 'Nombre', dataIndex: 'groupName', key: 'groupName' },
    { title: 'Descripción', dataIndex: 'groupDescription', key: 'groupDescription' },
    { title: 'Rol', dataIndex: 'role', key: 'role' },
  ];

  return (
    <div className="work-group-container">
      <div className="work-group-tables">
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)} className="create-group-button">
            Crear Grupo
          </Button>
        </div>
        <Table rowKey="groupId" dataSource={workGroups} columns={columns} />
      </div>
      <CreateWorkGroupModal visible={modalVisible} onCancel={() => setModalVisible(false)} onSuccess={handleCreateSuccess} />
    </div>
  );
};

export default WorkGroupUser;
