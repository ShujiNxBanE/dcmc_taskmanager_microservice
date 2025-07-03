import React, { useEffect, useState } from 'react';
import { Card, List, Form, Input, Button, Space, message, Popconfirm, Modal, Tag, Avatar } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import { CommentDTO } from 'app/rest/dto';
import commentClientApi from 'app/rest/CommentClientApi';
import { useAppSelector } from 'app/config/store';

const { TextArea } = Input;

interface CommentSectionProps {
  taskId: number;
  projectId?: number;
  workGroupId?: number;
  onSuccess?: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ taskId, projectId, workGroupId, onSuccess }) => {
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<CommentDTO | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const currentUser = useAppSelector(state => state.authentication.account?.login);

  useEffect(() => {
    loadComments();
  }, [taskId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await commentClientApi.getCommentsByTask(taskId);
      setComments(response.data);
    } catch (error: any) {
      message.error('Error al cargar los comentarios');
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: { content: string }) => {
    if (!values.content.trim()) return;

    setSubmitting(true);
    try {
      const data: CommentDTO = {
        content: values.content.trim(),
        taskId,
        projectId,
      };
      await commentClientApi.createComment(data);
      message.success('Comentario creado correctamente');
      form.resetFields();
      loadComments();
      onSuccess?.();
    } catch (error: any) {
      message.error('Error al crear el comentario');
      console.error('Error creating comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (values: { content: string }) => {
    if (!editingComment?.id || !values.content.trim()) return;

    try {
      const data: CommentDTO = {
        id: editingComment.id,
        content: values.content.trim(),
        taskId: editingComment.taskId,
        projectId: editingComment.projectId,
      };
      await commentClientApi.updateComment(editingComment.id, data);
      message.success('Comentario actualizado correctamente');
      setEditModalOpen(false);
      setEditingComment(null);
      editForm.resetFields();
      loadComments();
      onSuccess?.();
    } catch (error: any) {
      message.error('Error al actualizar el comentario');
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await commentClientApi.deleteComment(commentId);
      message.success('Comentario eliminado correctamente');
      loadComments();
      onSuccess?.();
    } catch (error: any) {
      message.error('Error al eliminar el comentario');
      console.error('Error deleting comment:', error);
    }
  };

  const openEditModal = (comment: CommentDTO) => {
    setEditingComment(comment);
    editForm.setFieldsValue({ content: comment.content });
    setEditModalOpen(true);
  };

  return (
    <>
      <Card title={`Comentarios (${comments.length})`}>
        <Form form={form} onFinish={handleSubmit} style={{ marginBottom: 16 }}>
          <Form.Item name="content" rules={[{ required: true, message: 'Escribe un comentario' }]}>
            <TextArea rows={3} placeholder="Escribe un comentario..." maxLength={500} showCount />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} icon={<SendOutlined />}>
              Comentar
            </Button>
          </Form.Item>
        </Form>

        <List
          loading={loading}
          dataSource={comments}
          locale={{ emptyText: 'No hay comentarios aún' }}
          renderItem={comment => (
            <List.Item>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                  <Avatar icon={<UserOutlined />} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 500 }}>@{comment.creatorLogin}</span>
                      {comment.creatorLogin === currentUser && (
                        <Tag color="blue" style={{ fontSize: '10px' }}>
                          Tú
                        </Tag>
                      )}
                      <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                        {comment.createdDate ? new Date(comment.createdDate).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div style={{ marginBottom: 8 }}>{comment.content}</div>
                    {comment.creatorLogin === currentUser && (
                      <Space>
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(comment)}>
                          Editar
                        </Button>
                        <Popconfirm
                          title="¿Seguro que deseas eliminar este comentario?"
                          okText="Sí"
                          cancelText="No"
                          onConfirm={() => comment.id && handleDelete(comment.id)}
                        >
                          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                            Eliminar
                          </Button>
                        </Popconfirm>
                      </Space>
                    )}
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="Editar comentario"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingComment(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form form={editForm} onFinish={handleEdit}>
          <Form.Item name="content" rules={[{ required: true, message: 'Escribe un comentario' }]}>
            <TextArea rows={4} placeholder="Escribe tu comentario..." maxLength={500} showCount />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingComment(null);
                  editForm.resetFields();
                }}
              >
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                Guardar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CommentSection;
