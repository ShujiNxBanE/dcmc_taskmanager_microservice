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
          message.error('Error al load users');
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
          message.error('Error al load users');
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
          message.error('Error al load group members');
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
      console.error('Error al load group members:', error);
      message.error('Error al load group members');
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

  // Verifica si the authenticated user is member or admin
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

  // Only members with role MEMBER or MODERATOR can leave the group
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

  // Verifica si the authenticated user can transfer ownership (only OWNER)
  const canTransferOwnership = () => {
    const user = members.find(m => m.login === currentUser?.login);
    return user && (user.role?.toUpperCase() === 'OWNER' || user.role?.toUpperCase() === 'PROPIETARIO');
  };

  // Verifica si the authenticated user can promote to moderator (OWNER or MODERATOR)
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

  // Verifica si a specific user can be promoted to moderator
  const canPromoteUser = (member: GroupMemberDTO) => {
    // Cannot promote to OWNER or to itself
    if (member.role?.toUpperCase() === 'OWNER' || member.role?.toUpperCase() === 'PROPIETARIO' || member.login === currentUser?.login) {
      return false;
    }
    // Can only promote to users with MEMBER role
    return member.role?.toUpperCase() === 'MEMBER' || member.role?.toUpperCase() === 'MIEMBRO';
  };

  // Verifica si the authenticated user can demote moderators (only OWNER)
  const canDemoteModerator = () => {
    const user = members.find(m => m.login === currentUser?.login);
    return user && (user.role?.toUpperCase() === 'OWNER' || user.role?.toUpperCase() === 'PROPIETARIO');
  };

  // Verifica if a specific user can be demoted
  const canDemoteUser = (member: GroupMemberDTO) => {
    // Can only demote to moderators
    return member.role?.toUpperCase() === 'MODERATOR' || member.role?.toUpperCase() === 'MODERADOR';
  };

  const handleAddMember = async () => {
    if (!groupId || !newUsername) return;
    setAdding(true);
    try {
      await WorkGroupClientApi.addMember(Number(groupId), newUsername);
      message.success('Member added successfully');
      setAddModalVisible(false);
      setNewUsername('');
      loadMembers(Number(groupId));
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error adding member');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = (username: string) => {
    if (!groupId || !username) return;
    Modal.confirm({
      title: 'Are you sure you want to remove this member?',
      content: `This action cannot be undone. User: ${username}`,
      okText: 'Yes, remove',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await WorkGroupClientApi.removeMember(Number(groupId), username);
          message.success('Member removed successfully');
          loadMembers(Number(groupId));
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Error removing member');
        }
      },
    });
  };

  const handleLeaveGroup = () => {
    if (!groupId) return;
    Modal.confirm({
      title: 'Are you sure you want to leave the group?',
      content: 'You will lose access to this work group.',
      okText: 'Yes, leave',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await WorkGroupClientApi.leaveGroup(Number(groupId));
          message.success('You have left the group successfully');
          navigate('/work-group');
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Error leaving group');
        }
      },
    });
  };

  const handleTransferOwnership = async () => {
    if (!groupId || !newOwnerUsername) return;
    setTransferring(true);
    try {
      await WorkGroupClientApi.transferOwnership(Number(groupId), newOwnerUsername);
      message.success('Group ownership transferred successfully');
      setTransferModalVisible(false);
      setNewOwnerUsername('');
      loadMembers(Number(groupId));
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error transferring group ownership');
    } finally {
      setTransferring(false);
    }
  };

  const handlePromoteToModerator = (username: string) => {
    if (!groupId || !username) return;
    Modal.confirm({
      title: 'Promote to moderator?',
      content: `Are you sure you want to promote @${username} to moderator of the group?`,
      okText: 'Yes, promote',
      cancelText: 'Cancel',
      okButtonProps: {
        style: { backgroundColor: '#10b981', borderColor: '#10b981' },
      },
      async onOk() {
        try {
          await WorkGroupClientApi.promoteToModerator(Number(groupId), username);
          message.success('User promoted to moderator successfully');
          loadMembers(Number(groupId));
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Error promoting user');
        }
      },
    });
  };

  const handleDemoteModerator = (username: string) => {
    if (!groupId || !username) return;
    Modal.confirm({
      title: 'Demote moderator?',
      content: `Are you sure you want to demote @${username} from moderator to member of the group?`,
      okText: 'Yes, demote',
      cancelText: 'Cancel',
      okButtonProps: {
        danger: true,
        style: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
      },
      async onOk() {
        try {
          await WorkGroupClientApi.demoteModerator(Number(groupId), username);
          message.success('Moderator demoted successfully');
          loadMembers(Number(groupId));
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Error demoting moderator');
        }
      },
    });
  };

  const handleAddModerator = async () => {
    if (!groupId || !newModeratorUsername) return;
    setAddingModerator(true);
    try {
      await WorkGroupClientApi.addModerator(Number(groupId), newModeratorUsername);
      message.success('Moderator added successfully');
      setAddModeratorModalVisible(false);
      setNewModeratorUsername('');
      loadMembers(Number(groupId));
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Error adding moderator');
    } finally {
      setAddingModerator(false);
    }
  };

  const handleRemoveModerator = (username: string) => {
    if (!groupId || !username) return;
    Modal.confirm({
      title: 'Remove moderator?',
      content: `Are you sure you want to remove @${username} as moderator of the group?`,
      okText: 'Yes, remove',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await WorkGroupClientApi.removeModerator(Number(groupId), username);
          message.success('Moderator removed successfully');
          loadMembers(Number(groupId));
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Error removing moderator');
        }
      },
    });
  };

  const columns = [
    {
      title: 'User',
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
                  You
                </Tag>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>ID: {record.id}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
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
          {record.role || 'No role'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render(_: any, record: GroupMemberDTO) {
        // Only OWNER, ADMIN or PROPIETARIO can remove members (and never to OWNER or itself)
        const user = members.find(m => m.login === currentUser?.login);
        const canRemove =
          user &&
          (user.role?.toUpperCase() === 'OWNER' || user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'PROPIETARIO') &&
          record.role?.toUpperCase() !== 'OWNER' &&
          record.login !== currentUser?.login;

        // Only OWNER can remove moderators
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
                title="Promote to moderator"
                style={{ color: '#10b981' }}
              >
                Promote
              </Button>
            )}
            {canDemoteModerator() && canDemoteUser(record) && (
              <Button
                type="text"
                onClick={() => handleDemoteModerator(record.login)}
                title="Demote from moderator"
                style={{ color: '#ef4444' }}
              >
                Demote
              </Button>
            )}
            {canRemove && (
              <Button danger type="text" onClick={() => handleRemoveMember(record.login)} title="Remove member">
                Remove
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
          Back to Work Groups
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
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Group Members</h1>
              </div>
              <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: 16, color: '#e2e8f0' }}>{groupInfo?.name}</p>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'right' }}>
                <Statistic
                  title={<span style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 500 }}>Total members</span>}
                  value={members.length}
                  valueStyle={{ color: 'white', fontSize: 32, fontWeight: 700 }}
                  suffix={members.length === 1 ? 'member' : 'members'}
                />
              </div>
            </Col>
          </Row>
        </Card>

        {/* Area of buttons with new design */}
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
                Add member
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
                Add moderator
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
                Transfer ownership
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
                Leave group
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
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} members`,
          }}
          className="work-group-tables"
          rowClassName={record => (isCurrentUser(record) ? 'current-user-row' : '')}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title="Add member to group"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onOk={handleAddMember}
        confirmLoading={adding}
        okText="Add"
        cancelText="Cancel"
      >
        <Select
          showSearch
          placeholder="Select a user"
          value={newUsername || undefined}
          onChange={v => setNewUsername(v)}
          options={userOptions}
          loading={loadingUsers}
          style={{ width: '100%' }}
          filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
          disabled={adding || loadingUsers}
          notFoundContent={loadingUsers ? <Spin size="small" /> : 'No users available'}
        />
      </Modal>

      <Modal
        title="Add moderator to group"
        open={addModeratorModalVisible}
        onCancel={() => setAddModeratorModalVisible(false)}
        onOk={handleAddModerator}
        confirmLoading={addingModerator}
        okText="Add moderator"
        cancelText="Cancel"
      >
        <Select
          showSearch
          placeholder="Select a user"
          value={newModeratorUsername || undefined}
          onChange={v => setNewModeratorUsername(v)}
          options={moderatorUserOptions}
          loading={loadingModeratorUsers}
          style={{ width: '100%' }}
          filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
          disabled={addingModerator || loadingModeratorUsers}
          notFoundContent={loadingModeratorUsers ? <Spin size="small" /> : 'No users available'}
        />
      </Modal>

      <Modal
        title="Transfer group ownership"
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        onOk={handleTransferOwnership}
        confirmLoading={transferring}
        okText="Transfer"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          style: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#6b7280', marginBottom: 8 }}>
            When transferring group ownership, you will lose your owner privileges and they will be granted to the new owner.
          </p>
          <p style={{ color: '#ef4444', fontWeight: 500 }}>This action cannot be undone.</p>
        </div>
        <Select
          showSearch
          placeholder="Select the new owner"
          value={newOwnerUsername || undefined}
          onChange={v => setNewOwnerUsername(v)}
          options={ownerOptions}
          loading={loadingOwnerOptions}
          style={{ width: '100%' }}
          filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
          disabled={transferring || loadingOwnerOptions}
          notFoundContent={loadingOwnerOptions ? <Spin size="small" /> : 'No members available'}
        />
      </Modal>
    </div>
  );
};

export default GroupMembers;
