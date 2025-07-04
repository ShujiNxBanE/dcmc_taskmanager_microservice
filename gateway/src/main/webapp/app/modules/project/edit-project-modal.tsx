import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { ProjectUpdateDTO, MinimalProjectDTO } from 'app/rest/dto';
import ProjectClientApi from 'app/rest/ProjectClientApi';
import './project-modal.scss';

interface EditProjectModalProps {
  visible: boolean;
  project: MinimalProjectDTO | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ visible, project, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Cargar los datos del proyecto cuando se abre el modal
  useEffect(() => {
    if (visible && project) {
      form.setFieldsValue({
        title: project.title,
        description: project.description,
      });
    }
  }, [visible, project, form]);

  const handleSubmit = async (values: any) => {
    if (!project?.id) {
      message.error('ID del proyecto no encontrado');
      return;
    }

    setLoading(true);
    try {
      const projectData: ProjectUpdateDTO = {
        title: values.title,
        description: values.description,
      };

      await ProjectClientApi.updateProject(project.id, projectData);
      message.success('Proyecto actualizado exitosamente');
      form.resetFields();
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Error al actualizar el proyecto:', error);
      message.error('Error al actualizar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal title="Edit Project" open={visible} onCancel={handleCancel} footer={null} width={500} className="project-modal" destroyOnClose>
      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <div className="form-group">
          <Form.Item
            label="Project Title"
            name="title"
            rules={[
              { required: true, message: 'Please enter the project title' },
              { min: 3, message: 'The title must be at least 3 characters' },
              { max: 100, message: 'The title cannot exceed 100 characters' },
            ]}
          >
            <Input placeholder="Enter the project title" />
          </Form.Item>
        </div>

        <div className="form-group">
          <Form.Item label="Description" name="description" rules={[{ max: 500, message: 'The description cannot exceed 500 characters' }]}>
            <Input.TextArea placeholder="Describe the purpose of the project (optional)" rows={4} />
          </Form.Item>
        </div>

        <div className="modal-actions">
          <Button onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} icon={<EditOutlined />}>
            Update Project
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditProjectModal;
