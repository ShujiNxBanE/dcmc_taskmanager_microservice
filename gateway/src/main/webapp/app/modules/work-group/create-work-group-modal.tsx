import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { WorkGroupDTO } from 'app/rest/dto';
import WorkGroupClientApi from 'app/rest/WorkGroupClientApi';
import './work-group-modal.scss';

interface CreateWorkGroupModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateWorkGroupModal: React.FC<CreateWorkGroupModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const workGroupData: WorkGroupDTO = {
        name: values.name,
        description: values.description,
        isActive: true,
      };

      await WorkGroupClientApi.createWorkGroup(workGroupData);
      message.success('Grupo de trabajo creado exitosamente');
      form.resetFields();
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Error al crear el grupo de trabajo:', error);
      message.error('Error al crear el grupo de trabajo');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Crear Nuevo Grupo de Trabajo"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      className="work-group-modal"
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <div className="form-group">
          <Form.Item
            label="Nombre del Grupo"
            name="name"
            rules={[
              { required: true, message: 'Por favor ingresa el nombre del grupo' },
              { min: 3, message: 'El nombre debe tener al menos 3 caracteres' },
              { max: 50, message: 'El nombre no puede exceder 50 caracteres' },
            ]}
          >
            <Input placeholder="Ingresa el nombre del grupo" />
          </Form.Item>
        </div>

        <div className="form-group">
          <Form.Item
            label="Descripción"
            name="description"
            rules={[{ max: 200, message: 'La descripción no puede exceder 200 caracteres' }]}
          >
            <Input.TextArea placeholder="Describe el propósito del grupo (opcional)" rows={4} />
          </Form.Item>
        </div>

        <div className="modal-actions">
          <Button onClick={handleCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>
            Crear Grupo
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateWorkGroupModal;
