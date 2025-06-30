import React, { useState } from 'react';
import { Modal, Button, message, Typography } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { MinimalProjectDTO } from 'app/rest/dto';
import ProjectClientApi from 'app/rest/ProjectClientApi';
import './project-modal.scss';

const { Text } = Typography;

interface DeleteProjectModalProps {
  visible: boolean;
  project: MinimalProjectDTO | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({ visible, project, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!project?.id) {
      message.error('ID del proyecto no encontrado');
      return;
    }

    setLoading(true);
    try {
      await ProjectClientApi.deleteProject(project.id);
      message.success('Proyecto eliminado exitosamente');
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Error al eliminar el proyecto:', error);
      message.error('Error al eliminar el proyecto');
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
          <span>Confirmar Eliminación</span>
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
        <Text>
          ¿Estás seguro de que quieres eliminar el proyecto{' '}
          <Text strong style={{ color: '#1f2937' }}>
            &ldquo;{project?.title}&rdquo;
          </Text>
          ?
        </Text>

        <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 6 }}>
          <Text type="danger" style={{ fontSize: 14 }}>
            <ExclamationCircleOutlined style={{ marginRight: 8 }} />
            Esta acción no se puede deshacer. El proyecto será marcado como inactivo y ya no aparecerá en las listas.
          </Text>
        </div>
      </div>

      <div className="modal-actions">
        <Button onClick={handleCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="primary" danger loading={loading} icon={<DeleteOutlined />} onClick={handleDelete}>
          Eliminar Proyecto
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteProjectModal;
