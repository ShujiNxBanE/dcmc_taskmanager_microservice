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
      message.error('Error loading comments');
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
      message.success('Comment created successfully');
      form.resetFields();
      loadComments();
      onSuccess?.();
    } catch (error: any) {
      message.error('Error creating comment');
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
      message.success('Comment updated successfully');
      setEditModalOpen(false);
      setEditingComment(null);
      editForm.resetFields();
      loadComments();
      onSuccess?.();
    } catch (error: any) {
      message.error('Error updating comment');
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await commentClientApi.deleteComment(commentId);
      message.success('Comment deleted successfully');
      loadComments();
      onSuccess?.();
    } catch (error: any) {
      message.error('Error deleting comment');
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
      <Card title={`Comments (${comments.length})`}>
        <Form form={form} onFinish={handleSubmit} style={{ marginBottom: 16 }}>
          <Form.Item name="content" rules={[{ required: true, message: 'Write a comment' }]}>
            <TextArea rows={3} placeholder="Write a comment..." maxLength={500} showCount />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} icon={<SendOutlined />}>
              Comment
            </Button>
          </Form.Item>
        </Form>

        <List
          loading={loading}
          dataSource={comments}
          locale={{ emptyText: 'No comments yet' }}
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
                          You
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
                          Edit
                        </Button>
                        <Popconfirm
                          title="Are you sure you want to delete this comment?"
                          okText="Yes"
                          cancelText="No"
                          onConfirm={() => comment.id && handleDelete(comment.id)}
                        >
                          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                            Delete
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
        title="Edit comment"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingComment(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form form={editForm} onFinish={handleEdit}>
          <Form.Item name="content" rules={[{ required: true, message: 'Write a comment' }]}>
            <TextArea rows={4} placeholder="Write your comment..." maxLength={500} showCount />
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
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CommentSection;
