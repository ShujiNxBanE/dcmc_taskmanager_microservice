// modules/work-group/work-group-user.tsx

import React, { useEffect, useState } from 'react';
import { WorkGroupDTO, UserGroupViewDTO } from 'app/rest/dto';
import WorkGroupClientApi from 'app/rest/WorkGroupClientApi';
import { message, Table } from 'antd';

const WorkGroupUser = () => {
  const [workGroups, setWorkGroups] = useState<UserGroupViewDTO[]>([]);

  const loadWorkGroups = async () => {
    try {
      const response = await WorkGroupClientApi.getMyActiveGroups();
      setWorkGroups(response.data);
    } catch (error) {
      console.error('Error al cargar mis grupos de trabajo:', error);
      message.error('Error al cargar mis grupos de trabajo');
    }
  };

  useEffect(() => {
    loadWorkGroups();
  }, []);

  const columns = [
    { title: 'Nombre', dataIndex: 'groupName', key: 'groupName' },
    { title: 'Descripción', dataIndex: 'groupDescription', key: 'groupDescription' },
    { title: 'Rol', dataIndex: 'role', key: 'role' },
  ];

  return <Table rowKey="groupId" dataSource={workGroups} columns={columns} />;
};

export default WorkGroupUser;
