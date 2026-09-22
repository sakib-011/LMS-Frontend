import React, { useEffect, useState } from 'react';
import { Button, Badge, Modal, Input, ConfirmationDialog } from '../../components/ui';
import { AdminService, UserManagementItem } from '../../services/adminService';
import './Admin.css';

const ROLES_LIST = [
  { id: 'ROLE_ADMIN', name: 'Administrator' },
  { id: 'ROLE_MODERATOR', name: 'Moderator' },
  { id: 'ROLE_STUDENT', name: 'Student' }
];

export const AdminUsers: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [users, setUsers] = useState<UserManagementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserManagementItem | null>(null);

  // Form states for creation
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: 'password123', role: 'STUDENT', department: 'Computer Science', phone: '' });

  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, userId?: string, actionType?: string}>({ isOpen: false, title: '', message: '' });

  const fetchUsers = async () => {
    try {
      const data = await AdminService.getUsers();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      const newUser = await AdminService.createUser(createForm as any);
      setUsers(prev => [...prev, newUser]);
      setIsCreateModalOpen(false);
      setCreateForm({ name: '', email: '', password: 'password123', role: 'STUDENT', department: 'Computer Science', phone: '' });
    } catch (err) {
      console.error("Failed to create user:", err);
    }
  };

  const handleSaveEditUser = async () => {
    if (!editingUser) return;
    try {
      const updated = await AdminService.updateUser(editingUser.id, editingUser);
      setUsers(prev => prev.map(u => u.id === editingUser.id ? updated : u));
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  const handleConfirmAction = async () => {
    if (confirmDialog.userId && confirmDialog.actionType === 'delete') {
      try {
        await AdminService.deleteUser(confirmDialog.userId);
        setUsers(prev => prev.filter(u => u.id !== confirmDialog.userId));
      } catch (err) {
        console.error("Failed to delete user:", err);
      }
    }
    setConfirmDialog({ isOpen: false, title: '', message: '' });
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'All' || (u.role && u.role.toUpperCase() === filterRole.toUpperCase());
    return matchesSearch && matchesRole;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Suspended': return 'neutral';
      case 'Blocked': return 'error';
      default: return 'neutral';
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">User Management</h1>
          <p className="admin-subtitle">Manage accounts, security states, and access levels in database</p>
        </div>
        <Button variant="primary" icon="fas fa-user-plus" onClick={() => setIsCreateModalOpen(true)}>Create User</Button>
      </div>

      <div className="admin-card">
        <div className="admin-header-actions" style={{ marginBottom: 'var(--space-6)', width: '100%' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: 10, color: 'var(--bg-secondary-text)' }}></i>
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <select 
            value={filterRole} 
            onChange={e => setFilterRole(e.target.value)}
            style={{ padding: '8px 16px', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)', background: 'white' }}
          >
            <option value="All">All Roles</option>
            {ROLES_LIST.map(r => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>Loading users from database...</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Department</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--bg-background)', color: 'var(--bg-secondary-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                          <i className="fas fa-user"></i>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#1e1b4b' }}>{user.name}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>{user.email} {user.phone ? `· ${user.phone}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user.role}</span>
                    </td>
                    <td>
                      <Badge variant={getStatusBadge(user.status || 'Active')} size="sm">{user.status || 'Active'}</Badge>
                    </td>
                    <td style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>
                      {user.department || 'General'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                        <Button size="sm" variant="outline" title="Edit User" onClick={() => { setEditingUser(user); setIsEditModalOpen(true); }}><i className="fas fa-edit"></i> Edit</Button>
                        <Button size="sm" variant="danger" title="Delete User" onClick={() => setConfirmDialog({
                          isOpen: true, title: 'Delete User', message: `Are you sure you want to delete ${user.name}? This will remove them from the database.`, userId: user.id, actionType: 'delete'
                        })}><i className="fas fa-trash-alt"></i> Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New User in Database"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateUser}>Create User</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Full Name" placeholder="e.g. John Doe" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} required />
          <Input label="Email Address" type="email" placeholder="e.g. john@university.edu" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} required />
          <Input label="Password" type="password" placeholder="Password" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} required />
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Role</label>
            <select value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)' }}>
              <option value="STUDENT">Student</option>
              <option value="MODERATOR">Moderator</option>
              <option value="ADMINISTRATOR">Administrator</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); setEditingUser(null); }}
        title="Edit User Details"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveEditUser}>Save Changes</Button>
          </div>
        }
      >
        {editingUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Full Name" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} />
            <Input label="Email Address" type="email" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} />
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Role</label>
              <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)' }}>
                <option value="STUDENT">Student</option>
                <option value="MODERATOR">Moderator</option>
                <option value="ADMINISTRATOR">Administrator</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={true}
      />
    </div>
  );
};
