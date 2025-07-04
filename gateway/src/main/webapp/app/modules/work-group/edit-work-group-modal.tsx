import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { WorkGroupDTO } from 'app/rest/dto';
import WorkGroupClientApi from 'app/rest/WorkGroupClientApi';
import './work-group-modal.scss';

interface EditWorkGroupModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  workGroup: WorkGroupDTO | null;
}

const EditWorkGroupModal: React.FC<EditWorkGroupModalProps> = ({ visible, onCancel, onSuccess, workGroup }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && workGroup) {
      form.setFieldsValue({
        name: workGroup.name,
        description: workGroup.description,
      });
    }
  }, [visible, workGroup, form]);

  const handleSubmit = async (values: any) => {
    if (!workGroup?.id) return;

    setLoading(true);
    try {
      const workGroupData: WorkGroupDTO = {
        id: workGroup.id,
        name: values.name,
        description: values.description,
        isActive: workGroup.isActive,
      };

      await WorkGroupClientApi.updateWorkGroup(workGroup.id, workGroupData);
      message.success('Work group updated successfully');
      form.resetFields();
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Error updating work group:', error);
      message.error('Error updating work group');
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
      title="Edit Work Group"
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
          <Button type="primary" htmlType="submit" loading={loading} icon={<EditOutlined />}>
            Update Group
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditWorkGroupModal;
