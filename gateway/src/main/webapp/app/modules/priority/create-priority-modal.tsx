import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import PriorityClientApi from './priorityClientApi';

interface CreatePriorityModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreatePriorityModal: React.FC<CreatePriorityModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await PriorityClientApi.createPriority({ name: values.name });
      message.success('Prioridad creada exitosamente');
      form.resetFields();
      onSuccess();
    } catch (error) {
      if (error instanceof Error) message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Crear Prioridad"
      onCancel={onCancel}
      onOk={handleOk}
      footer={[
        <Button key="back" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
          Crear
        </Button>,
      ]}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Nombre" name="name" rules={[{ required: true, message: 'El nombre es obligatorio' }]}>
          <Input placeholder="Nombre de la prioridad" maxLength={50} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreatePriorityModal;
