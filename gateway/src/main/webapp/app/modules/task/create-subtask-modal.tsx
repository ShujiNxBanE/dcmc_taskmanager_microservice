import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import priorityClientApi from 'app/modules/priority/priorityClientApi';
import statusClientApi from 'app/rest/StatusClientApi';
import taskClientApi from 'app/rest/TaskClientApi';
import { PriorityDTO, StatusDTO, TaskCreateDTO } from 'app/rest/dto';

interface CreateSubTaskModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  projectId: number;
  workGroupId: number;
  parentTaskId: number;
}

const CreateSubTaskModal: React.FC<CreateSubTaskModalProps> = ({ open, onCancel, onSuccess, projectId, workGroupId, parentTaskId }) => {
  const [form] = Form.useForm();
  const [priorities, setPriorities] = useState<PriorityDTO[]>([]);
  const [statuses, setStatuses] = useState<StatusDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      priorityClientApi.getAllPriorities().then(r => setPriorities(r.data));
      statusClientApi.getAllStatuses().then(r => setStatuses(r.data));
      form.resetFields();
    }
  }, [open]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const data: TaskCreateDTO = {
        title: values.title,
        description: values.description,
        priorityId: values.priorityId,
        statusId: values.statusId,
      };
      await taskClientApi.createSubTask(workGroupId, projectId, parentTaskId, data);
      message.success('Subtask created successfully');
      setLoading(false);
      onSuccess();
      onCancel();
    } catch (err: any) {
      setLoading(false);
      message.error(err.message || 'Error creating the subtask');
    }
  };

  return (
    <Modal open={open} title="Create new subtask" onCancel={onCancel} footer={null} destroyOnClose>
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Enter the title' }]}>
          <Input maxLength={100} />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea maxLength={500} rows={3} />
        </Form.Item>
        <Form.Item name="priorityId" label="Priority" rules={[{ required: true, message: 'Select a priority' }]}>
          <Select placeholder="Select a priority">
            {priorities.map(p => (
              <Select.Option key={p.id} value={p.id}>
                {p.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="statusId" label="Status" rules={[{ required: true, message: 'Select a status' }]}>
          <Select placeholder="Select a status">
            {statuses.map(s => (
              <Select.Option key={s.id} value={s.id}>
                {s.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleOk} loading={loading} block>
            Create subtask
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateSubTaskModal;
