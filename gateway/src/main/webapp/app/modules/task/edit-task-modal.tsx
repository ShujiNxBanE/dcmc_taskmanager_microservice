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
      if (!task?.id) throw new Error('Tarea no encontrada');
      await taskClientApi.updateTask(task.id, data);
      message.success('Tarea actualizada correctamente');
      setLoading(false);
      onSuccess();
      onCancel();
    } catch (err: any) {
      setLoading(false);
      message.error(err.message || 'Error al actualizar la tarea');
    }
  };

  return (
    <Modal open={open} title="Editar tarea" onCancel={onCancel} footer={null} destroyOnClose>
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="Título" rules={[{ required: true, message: 'Ingrese el título' }]}>
          <Input maxLength={100} />
        </Form.Item>
        <Form.Item name="description" label="Descripción">
          <Input.TextArea maxLength={500} rows={3} />
        </Form.Item>
        <Form.Item name="priorityId" label="Prioridad" rules={[{ required: true, message: 'Seleccione una prioridad' }]}>
          <Select placeholder="Seleccione una prioridad">
            {priorities.map(p => (
              <Select.Option key={p.id} value={p.id}>
                {p.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="statusId" label="Estado" rules={[{ required: true, message: 'Seleccione un estado' }]}>
          <Select placeholder="Seleccione un estado">
            {statuses.map(s => (
              <Select.Option key={s.id} value={s.id}>
                {s.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleOk} loading={loading} block>
            Guardar cambios
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditTaskModal;
