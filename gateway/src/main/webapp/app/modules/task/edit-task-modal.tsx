import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import priorityClientApi from 'app/modules/priority/priorityClientApi';
import statusClientApi from 'app/rest/StatusClientApi';
import taskClientApi from 'app/rest/TaskClientApi';
import { PriorityDTO, StatusDTO, TaskUpdateDTO, TaskSimpleDTO } from 'app/rest/dto';

interface EditTaskModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  task: TaskSimpleDTO | null;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ open, onCancel, onSuccess, task }) => {
  const [form] = Form.useForm();
  const [priorities, setPriorities] = useState<PriorityDTO[]>([]);
  const [statuses, setStatuses] = useState<StatusDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      priorityClientApi.getAllPriorities().then(r => setPriorities(r.data));
      statusClientApi.getAllStatuses().then(r => setStatuses(r.data));
    }
  }, [open]);

  useEffect(() => {
    if (open && task && priorities.length && statuses.length) {
      const currentPriority = priorities.find(p => p.name === task.priorityName);
      const currentStatus = statuses.find(s => s.name === task.statusName);
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        priorityId: currentPriority?.id,
        statusId: currentStatus?.id,
      });
    } else if (open && !task) {
      form.resetFields();
    }
  }, [open, task, priorities, statuses]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const data: TaskUpdateDTO = {
        title: values.title,
        description: values.description,
        priorityId: values.priorityId,
        statusId: values.statusId,
      };
      if (!task?.id) throw new Error('Task not found');
      await taskClientApi.updateTask(task.id, data);
      message.success('Task updated successfully');
      setLoading(false);
      onSuccess();
      onCancel();
    } catch (err: any) {
      setLoading(false);
      message.error(err.message || 'Error updating task');
    }
  };

  return (
    <Modal open={open} title="Edit task" onCancel={onCancel} footer={null} destroyOnClose>
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Enter title' }]}>
          <Input maxLength={100} />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea maxLength={500} rows={3} />
        </Form.Item>
        <Form.Item name="priorityId" label="Priority" rules={[{ required: true, message: 'Select priority' }]}>
          <Select placeholder="Select priority">
            {priorities.map(p => (
              <Select.Option key={p.id} value={p.id}>
                {p.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="statusId" label="Status" rules={[{ required: true, message: 'Select status' }]}>
          <Select placeholder="Select status">
            {statuses.map(s => (
              <Select.Option key={s.id} value={s.id}>
                {s.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleOk} loading={loading} block>
            Save changes
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditTaskModal;
