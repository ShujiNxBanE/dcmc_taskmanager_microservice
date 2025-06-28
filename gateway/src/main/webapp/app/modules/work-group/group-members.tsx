import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Avatar, Tag, Button, message, Card, Row, Col, Statistic, Space } from 'antd';
import { UserOutlined, ArrowLeftOutlined, CrownOutlined } from '@ant-design/icons';
import WorkGroupClientApi from 'app/rest/WorkGroupClientApi';
import { useAppSelector } from 'app/config/store';
import './work-group-modal.scss';

interface GroupMemberDTO {
  id: string;
  login: string;
  role: string;
  currentUser: boolean;
}

const GroupMembers = () => {
  const { groupId, groupName } = useParams<{ groupId: string; groupName: string }>();
  const navigate = useNavigate();
  const [members, setMembers] = useState<GroupMemberDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupInfo, setGroupInfo] = useState<{ id: number; name: string } | null>(null);
  const currentUser = useAppSelector(state => state.authentication.account);

  useEffect(() => {
    if (groupId) {
      setGroupInfo({
        id: parseInt(groupId, 10),
        name: decodeURIComponent(groupName || ''),
      });
      loadMembers(parseInt(groupId, 10));
    }
  }, [groupId, groupName]);

  const loadMembers = async (id: number) => {
    setLoading(true);
    try {
      const response = await WorkGroupClientApi.getActiveMembers(id);
      setMembers(response.data);
    } catch (error) {
      console.error('Error al cargar los miembros del grupo:', error);
      message.error('Error al cargar los miembros del grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/work-group');
  };

  const getRoleColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'OWNER':
      case 'ADMIN':
      case 'PROPIETARIO':
        return 'gold';
      case 'MEMBER':
      case 'MIEMBRO':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'OWNER':
      case 'ADMIN':
      case 'PROPIETARIO':
        return <CrownOutlined />;
      default:
        return null;
    }
  };

  const isCurrentUser = (member: GroupMemberDTO) => {
    return member.currentUser || member.login === currentUser?.login;
  };

  const columns = [
    {
      title: 'Usuario',
      key: 'user',
      render: (_: any, record: GroupMemberDTO) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: isCurrentUser(record) ? '8px' : '0',
            backgroundColor: isCurrentUser(record) ? '#f0f9ff' : 'transparent',
            borderRadius: isCurrentUser(record) ? '8px' : '0',
            border: isCurrentUser(record) ? '2px solid #3b82f6' : 'none',
          }}
        >
          <Avatar
            size={40}
            icon={<UserOutlined />}
            style={{
              backgroundColor: isCurrentUser(record) ? '#3b82f6' : '#6b7280',
              border: isCurrentUser(record) ? '2px solid #1d4ed8' : 'none',
            }}
          />
          <div>
            <div
              style={{
                fontWeight: 600,
                color: isCurrentUser(record) ? '#1e40af' : '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              @{record.login}
              {isCurrentUser(record) && (
                <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>
                  Tú
                </Tag>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>ID: {record.id}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Rol',
      key: 'role',
      render: (_: any, record: GroupMemberDTO) => (
        <Tag
          color={getRoleColor(record.role || '')}
          icon={getRoleIcon(record.role || '')}
          style={{
            borderRadius: 6,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {record.role || 'Sin rol'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: () => <Space size="small">{/* Espacio reservado para futuras acciones */}</Space>,
    },
  ];

  return (
    <div className="work-group-container">
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }} type="text">
          Volver a Grupos de Trabajo
        </Button>

        <Card
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: 16,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <div style={{ color: 'white' }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Miembros del Grupo</h1>
                <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: 16 }}>{groupInfo?.name}</p>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'right' }}>
                <Statistic
                  title="Total de miembros"
                  value={members.length}
                  valueStyle={{ color: 'white', fontSize: 32, fontWeight: 700 }}
                  suffix={members.length === 1 ? 'miembro' : 'miembros'}
                />
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      <Card
        style={{
          borderRadius: 16,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
        }}
      >
        <Table
          rowKey="id"
          dataSource={members}
          columns={columns}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} miembros`,
          }}
          className="work-group-tables"
          rowClassName={record => (isCurrentUser(record) ? 'current-user-row' : '')}
        />
      </Card>
    </div>
  );
};

export default GroupMembers;
