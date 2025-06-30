import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
import PriorityClientApi from './priorityClientApi';
import { PriorityDTO } from 'app/rest/dto';

interface HideUnhidePriorityModalProps {
  visible: boolean;
  action: 'hide' | 'unhide' | null;
  priority: PriorityDTO | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const HideUnhidePriorityModal: React.FC<HideUnhidePriorityModalProps> = ({ visible, action, priority, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!priority || !priority.id || !action) return;
    setLoading(true);
    try {
      if (action === 'hide') {
        await PriorityClientApi.hidePriority(priority.id);
        message.success('Prioridad ocultada exitosamente');
      } else {
        await PriorityClientApi.unhidePriority(priority.id);
        message.success('Prioridad mostrada exitosamente');
      }
      onSuccess();
    } catch (error) {
      message.error('Error al realizar la acción');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (action === 'hide') return 'Ocultar Prioridad';
    if (action === 'unhide') return 'Mostrar Prioridad';
    return '';
  };

  const getContent = () => {
    if (action === 'hide') return `¿Estás seguro de que deseas ocultar la prioridad "${priority?.name}"?`;
    if (action === 'unhide') return `¿Estás seguro de que deseas mostrar la prioridad "${priority?.name}"?`;
    return '';
  };

  return (
    <Modal
      visible={visible}
      title={getTitle()}
      onCancel={onCancel}
      onOk={handleAction}
      okButtonProps={{ loading }}
      okText={action === 'hide' ? 'Ocultar' : 'Mostrar'}
      cancelText="Cancelar"
      destroyOnClose
    >
      <p>{getContent()}</p>
    </Modal>
  );
};

export default HideUnhidePriorityModal;
