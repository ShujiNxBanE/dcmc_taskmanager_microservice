// modules/work-group/work-group-admin.tsx

import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import WorkGroupClientApi from 'app/rest/WorkGroupClientApi';
import { WorkGroupDTO } from 'app/rest/dto';

const WorkGroupAdmin = () => {
  const [workGroups, setWorkGroups] = useState<WorkGroupDTO[]>([]);

  const loadWorkGroups = async () => {
    try {
      const response = await WorkGroupClientApi.getAllWorkGroups();
      setWorkGroups(response.data);
    } catch (err) {
      message.error('Error al cargar los grupos de trabajo');
    }
  };

  useEffect(() => {
    loadWorkGroups();
  }, []);

  const columns = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Descripción', dataIndex: 'description', key: 'description' },
    {
      title: 'Activo',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (val: boolean) => (val ? 'Sí' : 'No'),
    },
  ];

  return <Table rowKey="id" dataSource={workGroups} columns={columns} />;
};

export default WorkGroupAdmin;
