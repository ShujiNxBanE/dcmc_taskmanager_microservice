import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Avatar, Tag, Button, message, Card, Row, Col, Statistic, Space, Modal, Input, Select, Spin } from 'antd';
import { UserOutlined, ArrowLeftOutlined, CrownOutlined, PlusOutlined, SwapOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
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
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [newOwnerUsername, setNewOwnerUsername] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [addModeratorModalVisible, setAddModeratorModalVisible] = useState(false);
  const [newModeratorUsername, setNewModeratorUsername] = useState('');
  const [addingModerator, setAddingModerator] = useState(false);
  const [moderatorUserOptions, setModeratorUserOptions] = useState<any[]>([]);
  const [loadingModeratorUsers, setLoadingModeratorUsers] = useState(false);
  const [ownerOptions, setOwnerOptions] = useState<any[]>([]);
  const [loadingOwnerOptions, setLoadingOwnerOptions] = useState(false);

  useEffect(() => {
    if (groupId) {
      setGroupInfo({
        id: parseInt(groupId, 10),
        name: decodeURIComponent(groupName || ''),
      });
      loadMembers(parseInt(groupId, 10));
    }
  }, [groupId, groupName]);

  useEffect(() => {
    if (addModalVisible) {
      setLoadingUsers(true);
      WorkGroupClientApi.getAllUsers()
        .then(res => {
          setUserOptions(res.data.map((u: any) => ({ label: `@${u.login}`, value: u.login })));
        })
        .catch(() => {
          message.error('Error al cargar usuarios');
        })
        .finally(() => setLoadingUsers(false));
    } else {
      setUserOptions([]);
      setNewUsername('');
    }
  }, [addModalVisible]);

  useEffect(() => {
    if (addModeratorModalVisible) {
      setLoadingModeratorUsers(true);
      WorkGroupClientApi.getAllUsers()
        .then(res => {
          setModeratorUserOptions(res.data.map((u: any) => ({ label: `@${u.login}`, value: u.login })));
        })
        .catch(() => {
          message.error('Error al cargar usuarios');
        })
        .finally(() => setLoadingModeratorUsers(false));
    } else {
      setModeratorUserOptions([]);
      setNewModeratorUsername('');
    }
  }, [addModeratorModalVisible]);

  useEffect(() => {
    if (transferModalVisible) {
      setLoadingOwnerOptions(true);
      WorkGroupClientApi.getActiveMembers(Number(groupId))
        .then(res => {
          setOwnerOptions(
            res.data
              .filter((m: any) => m.role?.toUpperCase() !== 'OWNER' && m.role?.toUpperCase() !== 'PROPIETARIO')
              .map((m: any) => ({ label: `@${m.login}`, value: m.login })),
          );
        })
        .catch(() => {
          message.error('Error al cargar miembros del grupo');
        })
        .finally(() => setLoadingOwnerOptions(false));
    } else {
      setOwnerOptions([]);
      setNewOwnerUsername('');
    }
  }, [transferModalVisible, groupId]);

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
      case 'MODERATOR':
      case 'MODERADOR':
        return 'green';
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
      case 'MODERATOR':
      case 'MODERADOR':
        return <SafetyCertificateOutlined />;
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

  // Solo los usuarios con rol MEMBER o MODERATOR pueden salirse del grupo
  const canLeaveGroup = () => {
    const user = members.find(m => m.login === currentUser?.login);
    return (
      user &&
      (user.role?.toUpperCase() === 'MEMBER' ||
        user.role?.toUpperCase() === 'MODERATOR' ||
        user.role?.toUpperCase() === 'MIEMBRO' ||
        user.role?.toUpperCase() === 'MODERADOR')
    );
  };

  // Verifica si el usuario autenticado puede transferir propiedad (solo OWNER)
  const canTransferOwnership = () => {
    const user = members.find(m => m.login === currentUser?.login);
    return user && (user.role?.toUpperCase() === 'OWNER' || user.role?.toUpperCase() === 'PROPIETARIO');
  };

  // Verifica si el usuario autenticado puede promover a moderador (OWNER o MODERATOR)
  const canPromoteToModerator = () => {
    const user = members.find(m => m.login === currentUser?.login);
    return (
      user &&
      (user.role?.toUpperCase() === 'OWNER' ||
        user.role?.toUpperCase() === 'PROPIETARIO' ||
        user.role?.toUpperCase() === 'MODERATOR' ||
        user.role?.toUpperCase() === 'ADMIN')
    );
  };

  // Verifica si un usuario específico puede ser promovido a moderador
  const canPromoteUser = (member: GroupMemberDTO) => {
    // No se puede promover al OWNER ni a sí mismo
    if (member.role?.toUpperCase() === 'OWNER' || member.role?.toUpperCase() === 'PROPIETARIO' || member.login === currentUser?.login) {
      return false;
    }
    // Solo se puede promover a usuarios con rol MEMBER
    return member.role?.toUpperCase() === 'MEMBER' || member.role?.toUpperCase() === 'MIEMBRO';
  };

  // Verifica si el usuario autenticado puede degradar moderadores (solo OWNER)
  const canDemoteModerator = () => {
    const user = members.find(m => m.login === currentUser?.login);
    return user && (user.role?.toUpperCase() === 'OWNER' || user.role?.toUpperCase() === 'PROPIETARIO');
  };

  // Verifica si un usuario específico puede ser degradado
  const canDemoteUser = (member: GroupMemberDTO) => {
    // Solo se puede degradar a moderadores
    return member.role?.toUpperCase() === 'MODERATOR' || member.role?.toUpperCase() === 'MODERADOR';
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

  const handleTransferOwnership = async () => {
    if (!groupId || !newOwnerUsername) return;
    setTransferring(true);
    try {
      await WorkGroupClientApi.transferOwnership(Number(groupId), newOwnerUsername);
      message.success('Propiedad del grupo transferida exitosamente');
      setTransferModalVisible(false);
      setNewOwnerUsername('');
      loadMembers(Number(groupId));
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al transferir la propiedad del grupo');
    } finally {
      setTransferring(false);
    }
  };

  const handlePromoteToModerator = (username: string) => {
    if (!groupId || !username) return;
    Modal.confirm({
      title: '¿Promover a moderador?',
      content: `¿Estás seguro de que quieres promover a @${username} a moderador del grupo?`,
      okText: 'Sí, promover',
      cancelText: 'Cancelar',
      okButtonProps: {
        style: { backgroundColor: '#10b981', borderColor: '#10b981' },
      },
      async onOk() {
        try {
          await WorkGroupClientApi.promoteToModerator(Number(groupId), username);
          message.success('Usuario promovido a moderador exitosamente');
          loadMembers(Number(groupId));
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Error al promover usuario');
        }
      },
    });
  };

  const handleDemoteModerator = (username: string) => {
    if (!groupId || !username) return;
    Modal.confirm({
      title: '¿Degradar moderador?',
      content: `¿Estás seguro de que quieres degradar a @${username} de moderador a miembro del grupo?`,
      okText: 'Sí, degradar',
      cancelText: 'Cancelar',
      okButtonProps: {
        danger: true,
        style: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
      },
      async onOk() {
        try {
          await WorkGroupClientApi.demoteModerator(Number(groupId), username);
          message.success('Moderador degradado exitosamente');
          loadMembers(Number(groupId));
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Error al degradar moderador');
        }
      },
    });
  };

  const handleAddModerator = async () => {
    if (!groupId || !newModeratorUsername) return;
    setAddingModerator(true);
    try {
      await WorkGroupClientApi.addModerator(Number(groupId), newModeratorUsername);
      message.success('Moderador añadido exitosamente');
      setAddModeratorModalVisible(false);
      setNewModeratorUsername('');
      loadMembers(Number(groupId));
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error al añadir moderador');
    } finally {
      setAddingModerator(false);
    }
  };

  const handleRemoveModerator = (username: string) => {
    if (!groupId || !username) return;
    Modal.confirm({
      title: '¿Eliminar moderador?',
      content: `¿Estás seguro de que quieres eliminar a @${username} como moderador del grupo?`,
      okText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await WorkGroupClientApi.removeModerator(Number(groupId), username);
          message.success('Moderador eliminado exitosamente');
          loadMembers(Number(groupId));
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Error al eliminar moderador');
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

        // Solo OWNER puede eliminar moderadores
        const canRemoveModerator =
          user &&
          (user.role?.toUpperCase() === 'OWNER' || user.role?.toUpperCase() === 'PROPIETARIO') &&
          record.role?.toUpperCase() === 'MODERATOR';

        return (
          <Space size="small">
            {canPromoteToModerator() && canPromoteUser(record) && (
              <Button
                type="text"
                onClick={() => handlePromoteToModerator(record.login)}
                title="Promover a moderador"
                style={{ color: '#10b981' }}
              >
                Promover
              </Button>
            )}
            {canDemoteModerator() && canDemoteUser(record) && (
              <Button
                type="text"
                onClick={() => handleDemoteModerator(record.login)}
                title="Degradar de moderador"
                style={{ color: '#ef4444' }}
              >
                Degradar
              </Button>
            )}
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
            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            border: 'none',
            borderRadius: 16,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 16 }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Miembros del Grupo</h1>
              </div>
              <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: 16, color: '#e2e8f0' }}>{groupInfo?.name}</p>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'right' }}>
                <Statistic
                  title={<span style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 500 }}>Total de miembros</span>}
                  value={members.length}
                  valueStyle={{ color: 'white', fontSize: 32, fontWeight: 700 }}
                  suffix={members.length === 1 ? 'miembro' : 'miembros'}
                />
              </div>
            </Col>
          </Row>
        </Card>

        {/* Área de botones con nuevo diseño */}
        <Card
          style={{
            marginTop: 16,
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            border: '1px solid #cbd5e1',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {canAddMember() && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{
                  borderRadius: 8,
                  fontWeight: 500,
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                  border: 'none',
                }}
                onClick={() => setAddModalVisible(true)}
              >
                Añadir miembro
              </Button>
            )}
            {canTransferOwnership() && (
              <Button
                type="primary"
                icon={<SafetyCertificateOutlined />}
                style={{
                  backgroundColor: '#10b981',
                  borderColor: '#10b981',
                  borderRadius: 8,
                  fontWeight: 500,
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                  border: 'none',
                }}
                onClick={() => setAddModeratorModalVisible(true)}
              >
                Añadir moderador
              </Button>
            )}
            {canTransferOwnership() && (
              <Button
                type="primary"
                icon={<SwapOutlined />}
                style={{
                  backgroundColor: '#f59e0b',
                  borderColor: '#f59e0b',
                  borderRadius: 8,
                  fontWeight: 500,
                  boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)',
                  border: 'none',
                }}
                onClick={() => setTransferModalVisible(true)}
              >
                Transferir propiedad
              </Button>
            )}
            {canLeaveGroup() && (
              <Button
                type="primary"
                danger
                style={{
                  borderRadius: 8,
                  fontWeight: 500,
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                  border: 'none',
                  backgroundColor: '#ef4444',
                }}
                onClick={handleLeaveGroup}
              >
                Salir del grupo
              </Button>
            )}
          </div>
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
        <Select
          showSearch
          placeholder="Selecciona un usuario"
          value={newUsername || undefined}
          onChange={v => setNewUsername(v)}
          options={userOptions}
          loading={loadingUsers}
          style={{ width: '100%' }}
          filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
          disabled={adding || loadingUsers}
          notFoundContent={loadingUsers ? <Spin size="small" /> : 'No hay usuarios disponibles'}
        />
      </Modal>

      <Modal
        title="Añadir moderador al grupo"
        open={addModeratorModalVisible}
        onCancel={() => setAddModeratorModalVisible(false)}
        onOk={handleAddModerator}
        confirmLoading={addingModerator}
        okText="Añadir moderador"
        cancelText="Cancelar"
      >
        <Select
          showSearch
          placeholder="Selecciona un usuario"
          value={newModeratorUsername || undefined}
          onChange={v => setNewModeratorUsername(v)}
          options={moderatorUserOptions}
          loading={loadingModeratorUsers}
          style={{ width: '100%' }}
          filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
          disabled={addingModerator || loadingModeratorUsers}
          notFoundContent={loadingModeratorUsers ? <Spin size="small" /> : 'No hay usuarios disponibles'}
        />
      </Modal>

      <Modal
        title="Transferir propiedad del grupo"
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        onOk={handleTransferOwnership}
        confirmLoading={transferring}
        okText="Transferir"
        cancelText="Cancelar"
        okButtonProps={{
          danger: true,
          style: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#6b7280', marginBottom: 8 }}>
            Al transferir la propiedad del grupo, perderás tus privilegios de propietario y se los otorgarás al nuevo propietario.
          </p>
          <p style={{ color: '#ef4444', fontWeight: 500 }}>Esta acción no se puede deshacer.</p>
        </div>
        <Select
          showSearch
          placeholder="Selecciona el nuevo propietario"
          value={newOwnerUsername || undefined}
          onChange={v => setNewOwnerUsername(v)}
          options={ownerOptions}
          loading={loadingOwnerOptions}
          style={{ width: '100%' }}
          filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
          disabled={transferring || loadingOwnerOptions}
          notFoundContent={loadingOwnerOptions ? <Spin size="small" /> : 'No hay miembros disponibles'}
        />
      </Modal>
    </div>
  );
};

export default GroupMembers;
