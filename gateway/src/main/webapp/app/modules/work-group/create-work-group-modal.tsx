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
      message.success('Work group created successfully');
      form.resetFields();
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Error creating work group:', error);
      message.error('Error creating work group');
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
      title="Create New Work Group"
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
            label="Work Group Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter the work group name' },
              { min: 3, message: 'The name must be at least 3 characters' },
              { max: 50, message: 'The name cannot exceed 50 characters' },
            ]}
          >
            <Input placeholder="Enter the work group name" />
          </Form.Item>
        </div>

        <div className="form-group">
          <Form.Item label="Description" name="description" rules={[{ max: 200, message: 'The description cannot exceed 200 characters' }]}>
            <Input.TextArea placeholder="Describe the purpose of the group (optional)" rows={4} />
          </Form.Item>
        </div>

        <div className="modal-actions">
          <Button onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>
            Create Group
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateWorkGroupModal;
