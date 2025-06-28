import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Avatar, Tag, Button, message, Card, Row, Col, Statistic, Space, Modal, Input } from 'antd';
import { UserOutlined, ArrowLeftOutlined, CrownOutlined, PlusOutlined } from '@ant-design/icons';
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
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [adding, setAdding] = useState(false);

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

  // Verifica si el usuario autenticado es miembro o admin
  const canAddMember = () => {
    const user = members.find(m => m.login === currentUser?.login);
    return (
      user &&
      (user.role?.toUpperCase() === 'OWNER' ||
        user.role?.toUpperCase() === 'ADMIN' ||
        user.role?.toUpperCase() === 'PROPIETARIO' ||
        user.role?.toUpperCase() === 'MEMBER' ||
        user.currentUser)
    );
  };

  // Verifica si el usuario autenticado es MEMBER
  const canLeaveGroup = () => {
    const user = members.find(m => m.login === currentUser?.login);
    return user && user.role?.toUpperCase() === 'MEMBER';
  };

  const handleAddMember = async () => {
    if (!groupId || !newUsername) return;
    setAdding(true);
    try {
      await WorkGroupClientApi.addMember(Number(groupId), newUsername);
      message.success('Miembro añadido exitosamente');
      setAddModalVisible(false);
      setNewUsername('');
      loadMembers(Number(groupId));
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al añadir miembro');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = (username: string) => {
    if (!groupId || !username) return;
    Modal.confirm({
      title: '¿Estás seguro de que quieres eliminar este miembro?',
      content: `Esta acción no se puede deshacer. Usuario: ${username}`,
      okText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await WorkGroupClientApi.removeMember(Number(groupId), username);
          message.success('Miembro eliminado exitosamente');
          loadMembers(Number(groupId));
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Error al eliminar miembro');
        }
      },
    });
  };

  const handleLeaveGroup = () => {
    if (!groupId) return;
    Modal.confirm({
      title: '¿Estás seguro de que quieres salir del grupo?',
      content: 'Perderás acceso a este grupo de trabajo.',
      okText: 'Sí, salir',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await WorkGroupClientApi.leaveGroup(Number(groupId));
          message.success('Has salido del grupo exitosamente');
          navigate('/work-group');
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Error al salir del grupo');
        }
      },
    });
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
      render(_: any, record: GroupMemberDTO) {
        // Solo OWNER, ADMIN o PROPIETARIO pueden eliminar miembros (y nunca al OWNER ni a sí mismos)
        const user = members.find(m => m.login === currentUser?.login);
        const canRemove =
          user &&
          (user.role?.toUpperCase() === 'OWNER' || user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'PROPIETARIO') &&
          record.role?.toUpperCase() !== 'OWNER' &&
          record.login !== currentUser?.login;

        return (
          <Space size="small">
            {canRemove && (
              <Button danger type="text" onClick={() => handleRemoveMember(record.login)} title="Eliminar miembro">
                Eliminar
              </Button>
            )}
          </Space>
        );
      },
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
              <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 16 }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Miembros del Grupo</h1>
                {canAddMember() && (
                  <Button type="primary" icon={<PlusOutlined />} style={{ marginLeft: 16 }} onClick={() => setAddModalVisible(true)}>
                    Añadir miembro
                  </Button>
                )}
                {canLeaveGroup() && (
                  <Button danger style={{ marginLeft: 16 }} onClick={handleLeaveGroup}>
                    Salir del grupo
                  </Button>
                )}
              </div>
              <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: 16 }}>{groupInfo?.name}</p>
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

      <Modal
        title="Añadir miembro al grupo"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onOk={handleAddMember}
        confirmLoading={adding}
        okText="Añadir"
        cancelText="Cancelar"
      >
        <Input
          placeholder="Nombre de usuario"
          value={newUsername}
          onChange={e => setNewUsername(e.target.value)}
          onPressEnter={handleAddMember}
          disabled={adding}
        />
      </Modal>
    </div>
  );
};

export default GroupMembers;
