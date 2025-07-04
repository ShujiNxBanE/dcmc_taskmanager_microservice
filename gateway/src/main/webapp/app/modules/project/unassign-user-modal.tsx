import React, { useState } from 'react';
import { Modal, Button, message, Avatar, Space } from 'antd';
import { UserOutlined, ExclamationCircleOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { UserDTO } from 'app/rest/dto';
import ProjectClientApi from 'app/rest/ProjectClientApi';
import './project-modal.scss';

interface UnassignUserModalProps {
  visible: boolean;
  projectId: number;
  projectTitle: string;
  user: UserDTO | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const UnassignUserModal: React.FC<UnassignUserModalProps> = ({ visible, projectId, projectTitle, user, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleUnassign = async () => {
    if (!user?.login) {
      message.error('Usuario no válido');
      return;
    }

    setLoading(true);
    try {
      await ProjectClientApi.unassignUserFromProject(projectId, user.login);
      message.success('Usuario desasignado exitosamente');
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Error al desasignar usuario:', error);
      message.error('Error al desasignar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
          <span>Confirm Unassignment</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={450}
      className="project-modal"
      destroyOnClose
    >
      <div style={{ padding: '16px 0' }}>
        <p>
          Are you sure you want to unassign the user{' '}
          <strong>{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.login}</strong> from the project{' '}
          <strong>&ldquo;{projectTitle}&rdquo;</strong>?
        </p>

        <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 6 }}>
          <p style={{ color: '#666', fontSize: 14, margin: 0 }}>
            <ExclamationCircleOutlined style={{ marginRight: 8 }} />
            The user will no longer have access to the project and its associated tasks.
          </p>
        </div>
      </div>

      <div className="modal-actions">
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="primary" danger loading={loading} icon={<UserDeleteOutlined />} onClick={handleUnassign}>
          Unassign User
        </Button>
      </div>
    </Modal>
  );
};

export default UnassignUserModal;
