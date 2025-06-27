// modules/work-group/work-group-user.tsx

import React, { useEffect, useState } from 'react';
import { WorkGroupDTO } from 'app/rest/dto';
import WorkGroupClientApi from 'app/rest/WorkGroupClientApi';
import { message, Table } from 'antd';

const WorkGroupUser = () => {
  const [workGroups, setWorkGroups] = useState<WorkGroupDTO[]>([]);

  const loadWorkGroups = async () => {
    try {
      const response = await WorkGroupClientApi.getAllWorkGroups();
      setWorkGroups(response.data);
    } catch (error) {
      message.error('Error al cargar los grupos de trabajo');
    }
  };

  useEffect(() => {
    loadWorkGroups();
  }, []);

  const columns = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Descripción', dataIndex: 'description', key: 'description' },
    { title: 'Activo', dataIndex: 'isActive', key: 'isActive', render: (val: boolean) => (val ? 'Sí' : 'No') },
  ];

  return <Table rowKey="id" dataSource={workGroups} columns={columns} />;
};

export default WorkGroupUser;
