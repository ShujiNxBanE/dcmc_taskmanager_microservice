import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { PriorityDTO } from 'app/rest/dto';
import PriorityClientApi from './priorityClientApi';
import CreatePriorityModal from './create-priority-modal';
import EditPriorityModal from './edit-priority-modal';
import DeletePriorityModal from './delete-priority-modal';
import HideUnhidePriorityModal from './hide-unhide-priority-modal';
import './priority-modal.scss';

const PriorityAdmin = () => {
  const [priorities, setPriorities] = useState<PriorityDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [hideUnhideModalVisible, setHideUnhideModalVisible] = useState(false);
  const [hideUnhideAction, setHideUnhideAction] = useState<'hide' | 'unhide' | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<PriorityDTO | null>(null);

  const loadPriorities = async () => {
    setLoading(true);
    try {
      const response = await PriorityClientApi.getAllPriorities();
      setPriorities(response.data);
    } catch (err) {
      message.error('Error al cargar prioridades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPriorities();
  }, []);

  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    loadPriorities();
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    setSelectedPriority(null);
    loadPriorities();
  };

  const handleDeleteSuccess = () => {
    setDeleteModalVisible(false);
    setSelectedPriority(null);
    loadPriorities();
  };

  const handleHide = (priority: PriorityDTO) => {
    setSelectedPriority(priority);
    setHideUnhideAction('hide');
    setHideUnhideModalVisible(true);
  };

  const handleUnhide = (priority: PriorityDTO) => {
    setSelectedPriority(priority);
    setHideUnhideAction('unhide');
    setHideUnhideModalVisible(true);
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'Estado',
      dataIndex: 'isHidden',
      key: 'isHidden',
      render: (isHidden: boolean) => (isHidden ? <Tag color="red">Oculta</Tag> : <Tag color="green">Visible</Tag>),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: PriorityDTO) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            style={{ color: '#3b82f6' }}
            title="Editar prioridad"
            onClick={() => {
              setSelectedPriority(record);
              setEditModalVisible(true);
            }}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            style={{ color: '#ef4444' }}
            title="Eliminar prioridad"
            onClick={() => {
              setSelectedPriority(record);
              setDeleteModalVisible(true);
            }}
          />
          {record.isHidden ? (
            <Button
              type="text"
              icon={<EyeOutlined />}
              style={{ color: '#10b981' }}
              title="Mostrar prioridad"
              onClick={() => handleUnhide(record)}
            />
          ) : (
            <Button
              type="text"
              icon={<EyeInvisibleOutlined />}
              style={{ color: '#f59e42' }}
              title="Ocultar prioridad"
              onClick={() => handleHide(record)}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="priority-container">
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          Crear Prioridad
        </Button>
      </div>
      <Table rowKey="id" dataSource={priorities} columns={columns} loading={loading} />
      <CreatePriorityModal visible={createModalVisible} onCancel={() => setCreateModalVisible(false)} onSuccess={handleCreateSuccess} />
      <EditPriorityModal
        visible={editModalVisible}
        priority={selectedPriority}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedPriority(null);
        }}
        onSuccess={handleEditSuccess}
      />
      <DeletePriorityModal
        visible={deleteModalVisible}
        priority={selectedPriority}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedPriority(null);
        }}
        onSuccess={handleDeleteSuccess}
      />
      <HideUnhidePriorityModal
        visible={hideUnhideModalVisible}
        action={hideUnhideAction}
        priority={selectedPriority}
        onCancel={() => {
          setHideUnhideModalVisible(false);
          setSelectedPriority(null);
          setHideUnhideAction(null);
        }}
        onSuccess={() => {
          setHideUnhideModalVisible(false);
          setSelectedPriority(null);
          setHideUnhideAction(null);
          loadPriorities();
        }}
      />
    </div>
  );
};

export default PriorityAdmin;
