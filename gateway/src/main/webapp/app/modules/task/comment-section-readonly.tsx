import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { CommentDTO } from 'app/rest/dto';
import commentClientApi from 'app/rest/CommentClientApi';
import { useAppSelector } from 'app/config/store';

interface CommentSectionReadonlyProps {
  taskId: number;
}

const CommentSectionReadonly: React.FC<CommentSectionReadonlyProps> = ({ taskId }) => {
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [loading, setLoading] = useState(false);
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
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={`Comentarios (${comments.length})`}>
      <List
        loading={loading}
        dataSource={comments}
        locale={{ emptyText: 'No hay comentarios' }}
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
                  <div>{comment.content}</div>
                </div>
              </div>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default CommentSectionReadonly;
