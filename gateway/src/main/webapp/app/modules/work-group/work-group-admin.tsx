// modules/work-group/work-group-admin.tsx

import React, { useEffect, useState } from 'react';
import { Table, message, Tabs, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import WorkGroupClientApi from 'app/rest/WorkGroupClientApi';
import { WorkGroupDTO, UserGroupViewDTO } from 'app/rest/dto';
import CreateWorkGroupModal from './create-work-group-modal';
import './work-group-modal.scss';

const WorkGroupAdmin = () => {
  const [allWorkGroups, setAllWorkGroups] = useState<WorkGroupDTO[]>([]);
  const [myWorkGroups, setMyWorkGroups] = useState<UserGroupViewDTO[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingMy, setLoadingMy] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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

  useEffect(() => {
    loadAllWorkGroups();
    loadMyWorkGroups();
  }, []);

  const allColumns = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Descripción', dataIndex: 'description', key: 'description' },
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
    </div>
  );
};

export default WorkGroupAdmin;
