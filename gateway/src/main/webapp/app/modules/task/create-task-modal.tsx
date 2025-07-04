import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import priorityClientApi from 'app/modules/priority/priorityClientApi';
import statusClientApi from 'app/rest/StatusClientApi';
import projectClientApi from 'app/rest/ProjectClientApi';
import taskClientApi from 'app/rest/TaskClientApi';
import { PriorityDTO, StatusDTO, TaskCreateDTO, ProjectDTO } from 'app/rest/dto';

interface CreateTaskModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ open, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [priorities, setPriorities] = useState<PriorityDTO[]>([]);
  const [statuses, setStatuses] = useState<StatusDTO[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      priorityClientApi.getAllPriorities().then(r => setPriorities(r.data));
      statusClientApi.getAllStatuses().then(r => setStatuses(r.data));
      projectClientApi.getAssignedProjects().then(r => setProjects(r.data));
      form.resetFields();
    }
  }, [open]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const selectedProject = projects.find(p => p.id === values.projectId);
      if (!selectedProject) throw new Error('Project not found');
      const workGroupId = selectedProject.workGroup?.id;
      if (!workGroupId) throw new Error('The project does not have a WorkGroup associated');
      const data: TaskCreateDTO = {
        title: values.title,
        description: values.description,
        priorityId: values.priorityId,
        statusId: values.statusId,
      };
      await taskClientApi.createTask(workGroupId, values.projectId, data);
      message.success('Task created successfully');
      setLoading(false);
      onSuccess();
      onCancel();
    } catch (err: any) {
      setLoading(false);
      message.error(err.message || 'Error creating task');
    }
  };

  return (
    <Modal open={open} title="Create new task" onCancel={onCancel} footer={null} destroyOnClose>
      <Form form={form} layout="vertical">
        <Form.Item name="projectId" label="Project" rules={[{ required: true, message: 'Select a project' }]}>
          <Select placeholder="Select a project">
            {projects.map(p => (
              <Select.Option key={p.id} value={p.id}>
                {p.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
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
            Create task
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateTaskModal;
