// modules/work-group/work-group-admin.tsx

import React, { useEffect, useState } from 'react';
import { Table, message, Tabs } from 'antd';
import WorkGroupClientApi from 'app/rest/WorkGroupClientApi';
import { WorkGroupDTO, UserGroupViewDTO } from 'app/rest/dto';

const WorkGroupAdmin = () => {
  const [allWorkGroups, setAllWorkGroups] = useState<WorkGroupDTO[]>([]);
  const [myWorkGroups, setMyWorkGroups] = useState<UserGroupViewDTO[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingMy, setLoadingMy] = useState(false);

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
      children: <Table rowKey="id" dataSource={allWorkGroups} columns={allColumns} loading={loadingAll} />,
    },
    {
      key: 'my',
      label: 'Mis Grupos',
      children: <Table rowKey="groupId" dataSource={myWorkGroups} columns={myColumns} loading={loadingMy} />,
    },
  ];

  return <Tabs items={tabItems} />;
};

export default WorkGroupAdmin;
