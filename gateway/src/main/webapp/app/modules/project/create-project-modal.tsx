import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProjectCreateDTO } from 'app/rest/dto';
import ProjectClientApi from 'app/rest/ProjectClientApi';
import WorkGroupClientApi from 'app/rest/WorkGroupClientApi';
import { UserGroupViewDTO } from 'app/rest/dto';
import './project-modal.scss';

interface CreateProjectModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [workGroups, setWorkGroups] = useState<UserGroupViewDTO[]>([]);
  const [loadingWorkGroups, setLoadingWorkGroups] = useState(false);

  // Cargar los grupos de trabajo del usuario
  const loadWorkGroups = async () => {
    setLoadingWorkGroups(true);
    try {
      const response = await WorkGroupClientApi.getMyActiveGroups();
      setWorkGroups(response.data);
    } catch (error) {
      console.error('Error al cargar grupos de trabajo:', error);
      message.error('Error al cargar grupos de trabajo');
    } finally {
      setLoadingWorkGroups(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadWorkGroups();
    }
  }, [visible]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const projectData: ProjectCreateDTO = {
        title: values.title,
        description: values.description,
      };

      await ProjectClientApi.createProject(values.workGroupId, projectData);
      message.success('Project created successfully');
      form.resetFields();
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Error al crear el proyecto:', error);
      message.error('Error al crear el proyecto');
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
      title="Create New Project"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      className="project-modal"
      destroyOnClose
    >
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

        <div className="form-group">
          <Form.Item label="Work Group" name="workGroupId" rules={[{ required: true, message: 'Please select a work group' }]}>
            <Select
              placeholder="Select a work group"
              loading={loadingWorkGroups}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())}
            >
              {workGroups.map(group => (
                <Select.Option key={group.groupId} value={group.groupId}>
                  {group.groupName}
                  {group.groupDescription && ` - ${group.groupDescription}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div className="modal-actions">
          <Button onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>
            Create Project
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateProjectModal;
