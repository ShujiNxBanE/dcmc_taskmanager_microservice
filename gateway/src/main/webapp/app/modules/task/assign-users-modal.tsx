import React, { useEffect, useState } from 'react';
import { Modal, Table, Checkbox, Button, message, Spin } from 'antd';
import { UserDTO } from 'app/rest/dto';
import projectClientApi from 'app/rest/ProjectClientApi';
import taskClientApi from 'app/rest/TaskClientApi';

interface AssignUsersModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  taskId: number;
  workGroupId: number;
  projectId: number;
  currentAssignedUsers: UserDTO[];
}

const AssignUsersModal = ({ open, onCancel, onSuccess, taskId, workGroupId, projectId, currentAssignedUsers }: AssignUsersModalProps) => {
  const [availableUsers, setAvailableUsers] = useState<UserDTO[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && projectId) {
      loadAvailableUsers();
    }
  }, [open, projectId]);

  const loadAvailableUsers = async () => {
    setLoading(true);
    try {
      const response = await projectClientApi.getAssignedUsers(projectId);
      const allUsers = response.data;

      // Filtrar usuarios que ya están asignados a la tarea
      const currentAssignedUserIds = currentAssignedUsers.map(user => user.id?.toString() || '');
      const availableUsersFiltered = allUsers.filter(user => !currentAssignedUserIds.includes(user.id?.toString() || ''));

      setAvailableUsers(availableUsersFiltered);
    } catch (error: any) {
      message.error('Error al cargar los usuarios disponibles');
      console.error('Error loading available users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUsers = async () => {
    if (selectedUserIds.length === 0) {
      message.warning('Por favor selecciona al menos un usuario');
      return;
    }

    setSubmitting(true);
    try {
      await taskClientApi.assignUsersToTask(workGroupId, taskId, selectedUserIds);
      message.success('Usuarios asignados correctamente');
      setSelectedUserIds([]);
      onSuccess();
      onCancel();
    } catch (error: any) {
      message.error(error.response?.data?.detail || error.message || 'Error al asignar usuarios');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds(prev => [...prev, userId]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(availableUsers.map(user => user.id?.toString() || ''));
    } else {
      setSelectedUserIds([]);
    }
  };

  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedUserIds.length === availableUsers.length && availableUsers.length > 0}
          indeterminate={selectedUserIds.length > 0 && selectedUserIds.length < availableUsers.length}
          onChange={e => handleSelectAll(e.target.checked)}
        />
      ),
      dataIndex: 'id',
      key: 'select',
      width: 50,
      render: (userId: number) => (
        <Checkbox
          checked={selectedUserIds.includes(userId.toString())}
          onChange={e => handleUserSelection(userId.toString(), e.target.checked)}
        />
      ),
    },
    {
      title: 'Usuario',
      dataIndex: 'login',
      key: 'login',
      render: (login: string) => <span style={{ fontWeight: 500 }}>@{login}</span>,
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => <span style={{ color: '#666' }}>{id}</span>,
    },
  ];

  return (
    <Modal
      title="Assign Users to Task"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="assign" type="primary" loading={submitting} onClick={handleAssignUsers} disabled={selectedUserIds.length === 0}>
          Assign ({selectedUserIds.length})
        </Button>,
      ]}
      width={600}
    >
      <div style={{ marginBottom: 16 }}>
        <p>Select the users you want to assign to this task:</p>
        {selectedUserIds.length > 0 && <p style={{ color: '#1890ff', fontWeight: 500 }}>{selectedUserIds.length} user(s) selected</p>}
      </div>

      <Table
        columns={columns}
        dataSource={availableUsers}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'No users available to assign' }}
        size="small"
      />
    </Modal>
  );
};

export default AssignUsersModal;
