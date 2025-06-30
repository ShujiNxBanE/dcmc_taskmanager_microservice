import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import PriorityClientApi from './priorityClientApi';
import { PriorityDTO } from 'app/rest/dto';

interface EditPriorityModalProps {
  visible: boolean;
  priority: PriorityDTO | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditPriorityModal: React.FC<EditPriorityModalProps> = ({ visible, priority, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (priority) {
      form.setFieldsValue({ name: priority.name });
    } else {
      form.resetFields();
    }
  }, [priority, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (priority && priority.id) {
        await PriorityClientApi.updatePriority(priority.id, { ...priority, name: values.name });
        message.success('Prioridad actualizada exitosamente');
        onSuccess();
      }
    } catch (error) {
      if (error instanceof Error) message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Editar Prioridad"
      onCancel={onCancel}
      onOk={handleOk}
      footer={[
        <Button key="back" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
          Guardar
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

export default EditPriorityModal;
