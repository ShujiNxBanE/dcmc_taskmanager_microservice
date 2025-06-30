import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
import PriorityClientApi from './priorityClientApi';
import { PriorityDTO } from 'app/rest/dto';

interface DeletePriorityModalProps {
  visible: boolean;
  priority: PriorityDTO | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const DeletePriorityModal: React.FC<DeletePriorityModalProps> = ({ visible, priority, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!priority || !priority.id) return;
    setLoading(true);
    try {
      await PriorityClientApi.deletePriority(priority.id);
      message.success('Prioridad eliminada exitosamente');
      onSuccess();
    } catch (error) {
      message.error('Error al eliminar la prioridad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Eliminar Prioridad"
      onCancel={onCancel}
      onOk={handleDelete}
      okButtonProps={{ danger: true, loading }}
      okText="Eliminar"
      cancelText="Cancelar"
      destroyOnClose
    >
      <p>
        ¿Estás seguro de que deseas eliminar la prioridad <b>{priority?.name}</b>?
      </p>
    </Modal>
  );
};

export default DeletePriorityModal;
