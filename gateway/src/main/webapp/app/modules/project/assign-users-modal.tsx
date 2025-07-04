import React, { useState } from 'react';
import { Modal, Input, Button, message, Space } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import { ProjectAssignUsersDTO } from 'app/rest/dto';
import ProjectClientApi from 'app/rest/ProjectClientApi';
import './project-modal.scss';

interface AssignUsersModalProps {
  visible: boolean;
  projectId: number;
  projectTitle: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const AssignUsersModal: React.FC<AssignUsersModalProps> = ({ visible, projectId, projectTitle, onCancel, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim()) {
      message.warning('Debes ingresar un nombre de usuario');
      return;
    }

    setLoading(true);
    try {
      const assignUsersData: ProjectAssignUsersDTO = {
        userIds: [username.trim()],
      };

      await ProjectClientApi.assignUsersToProject(projectId, assignUsersData);
      message.success('Usuario asignado exitosamente');
      setUsername('');
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Error al asignar usuario:', error);
      message.error('Error al asignar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername('');
    onCancel();
  };

  return (
    <Modal
      title={
        <span>
          <TeamOutlined style={{ marginRight: 8 }} />
          Assign User to Project
        </span>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      className="project-modal"
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <p>
          <strong>Project:</strong> {projectTitle}
        </p>
        <p style={{ color: '#666', fontSize: 14 }}>Enter the username you want to assign to the project.</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Username:</label>
        <Input
          placeholder="E.g.: john.doe"
          value={username}
          onChange={e => setUsername(e.target.value)}
          prefix={<UserOutlined />}
          onPressEnter={handleSubmit}
          autoFocus
        />
      </div>

      <div className="modal-actions">
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="primary" loading={loading} icon={<TeamOutlined />} onClick={handleSubmit}>
          Assign User
        </Button>
      </div>
    </Modal>
  );
};

export default AssignUsersModal;
