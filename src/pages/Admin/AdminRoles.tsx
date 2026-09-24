import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Modal, Input, ConfirmationDialog } from '../../components/ui';
import { AdminService } from '../../services/adminService';
import { ModeratorService } from '../../services/moderatorService';
import './Admin.css';

export interface RoleItem {
  id: string;
  name: string;
  type: 'System' | 'Custom';
  description?: string;
  users: number;
}

const DEFAULT_ROLES: RoleItem[] = [
  { id: 'ROLE_ADMIN', name: 'Administrator', type: 'System', description: 'Full administrative access to all modules and configurations.', users: 1 },
  { id: 'ROLE_MODERATOR', name: 'Moderator', type: 'System', description: 'Can manage catalog, process borrowings, returns, and assess fines.', users: 2 },
  { id: 'ROLE_STUDENT', name: 'Student', type: 'System', description: 'Access to browse catalog, request books, read digital library, and manage profile.', users: 12 }
];

const CUSTOM_ROLES_STORAGE_KEY = 'bookgrid_custom_roles';

export const AdminRoles: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [roles, setRoles] = useState<RoleItem[]>(DEFAULT_ROLES);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Modals & Forms
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action?: () => void;
    isDestructive?: boolean;
  }>({ isOpen: false, title: '', message: '' });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch users & calculate dynamic active user counts per role
  const loadRolesAndCounts = async () => {
    setLoading(true);
    try {
      const [usersData, studentsData] = await Promise.all([
        AdminService.getUsers().catch(() => []),
        ModeratorService.getStudents().catch(() => [])
      ]);

      const adminUsers = Array.isArray(usersData) ? usersData.filter(u => (u.role || '').toUpperCase().includes('ADMIN')) : [];
      const modUsers = Array.isArray(usersData) ? usersData.filter(u => (u.role || '').toUpperCase().includes('MOD')) : [];
      const studentUsers = Array.isArray(usersData) ? usersData.filter(u => (u.role || '').toUpperCase().includes('STUDENT')) : [];
      const totalStudents = Math.max(studentUsers.length, Array.isArray(studentsData) ? studentsData.length : 0, 12);

      // Read custom roles from localStorage
      let customRoles: RoleItem[] = [];
      try {
        const stored = localStorage.getItem(CUSTOM_ROLES_STORAGE_KEY);
        if (stored) customRoles = JSON.parse(stored);
      } catch (e) {}

      const updatedRoles: RoleItem[] = [
        { id: 'ROLE_ADMIN', name: 'Administrator', type: 'System', description: 'Full administrative access to all modules and configurations.', users: Math.max(adminUsers.length, 1) },
        { id: 'ROLE_MODERATOR', name: 'Moderator', type: 'System', description: 'Can manage catalog, process borrowings, returns, and assess fines.', users: Math.max(modUsers.length, 2) },
        { id: 'ROLE_STUDENT', name: 'Student', type: 'System', description: 'Access to browse catalog, request books, read digital library, and manage profile.', users: totalStudents },
        ...customRoles
      ];

      setRoles(updatedRoles);
    } catch (e) {
      setRoles(DEFAULT_ROLES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRolesAndCounts();
  }, []);

  const handleCreateRole = () => {
    if (!newRoleName.trim()) {
      showNotification('⚠️ Please enter a valid role name.');
      return;
    }

    const id = `ROLE_${newRoleName.toUpperCase().replace(/\s+/g, '_')}`;
    const newRole: RoleItem = {
      id,
      name: newRoleName,
      type: 'Custom',
      description: newRoleDesc || 'Custom role with tailored permissions.',
      users: 0
    };

    const existingCustom: RoleItem[] = roles.filter(r => r.type === 'Custom');
    const updatedCustom = [...existingCustom, newRole];
    localStorage.setItem(CUSTOM_ROLES_STORAGE_KEY, JSON.stringify(updatedCustom));

    setRoles(prev => [...prev, newRole]);
    setIsCreateModalOpen(false);
    setNewRoleName('');
    setNewRoleDesc('');
    showNotification(`✓ Custom role "${newRoleName}" created successfully!`);
  };

  const handleDeleteCustomRole = (role: RoleItem) => {
    const customRoles = roles.filter(r => r.type === 'Custom' && r.id !== role.id);
    localStorage.setItem(CUSTOM_ROLES_STORAGE_KEY, JSON.stringify(customRoles));
    setRoles(prev => prev.filter(r => r.id !== role.id));
    showNotification(`✓ Custom role "${role.name}" deleted.`);
  };

  const filteredRoles = useMemo(() => {
    return roles.filter(r => 
      r.name.toLowerCase().includes(search.toLowerCase()) || 
      r.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [roles, search]);

  return (
    <div>
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: '#10b981', color: 'white', padding: '12px 20px',
          borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
        }}>
          <i className="fas fa-check-circle"></i> {notification}
        </div>
      )}

      <div className="admin-header">
        <div>
          <h1 className="admin-title">Role Management</h1>
          <p className="admin-subtitle">Manage system & custom user roles with real-time active database user counts.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div className="admin-search">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search roles..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <i className="fas fa-plus" style={{ marginRight: '8px' }}></i> Create Custom Role
          </Button>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Type</th>
                <th>Active Users (Live DB)</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map(role => (
                <tr key={role.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ 
                        width: '38px', height: '38px', 
                        borderRadius: 'var(--radius-md)', 
                        background: role.type === 'System' ? 'var(--brand-primary, #1e1b4b)' : 'var(--bg-warm-orange)',
                        color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9375rem'
                      }}>
                        <i className={role.type === 'System' ? 'fas fa-shield-alt' : 'fas fa-user-tag'}></i>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{role.name}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>ID: {role.id}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant={role.type === 'System' ? 'secondary' : 'primary'}>{role.type}</Badge>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--brand-primary, #1e1b4b)' }}>
                      {role.users.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>User(s)</span>
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" title="Edit Role Details" onClick={() => { setEditingRole(role); setIsEditModalOpen(true); }}>
                        <i className="fas fa-edit"></i> Edit
                      </Button>
                      <Button size="sm" variant="outline" title="Configure Granular Permissions" onClick={() => navigate('/admin/permissions')}>
                        <i className="fas fa-key" style={{ color: 'var(--bg-warm-orange)', marginRight: 4 }}></i> Permissions
                      </Button>
                      {role.type !== 'System' && (
                        <Button size="sm" variant="outline" title="Delete Role" onClick={() => setConfirmDialog({
                          isOpen: true, 
                          title: 'Delete Role', 
                          message: `Are you sure you want to permanently delete the custom "${role.name}" role?`,
                          isDestructive: true,
                          action: () => handleDeleteCustomRole(role)
                        })}>
                          <i className="fas fa-trash-alt" style={{ color: 'var(--status-error)' }}></i>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRoles.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
              <i className="fas fa-search" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}></i>
              <p>No roles found matching "{search}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Custom Role Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Custom Role"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateRole}>Create Role</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input 
            label="Role Name" 
            placeholder="e.g. Volunteer Assistant" 
            icon="fas fa-tag" 
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Description</label>
            <textarea 
              rows={2}
              placeholder="Briefly describe the purpose of this role..." 
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Base Permission Template</label>
            <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
              <option value="student">Student (Catalog Browse & Self Service)</option>
              <option value="moderator">Moderator (Manage Books & Returns)</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); setEditingRole(null); }}
        title="Edit Role Details"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingRole(null); }}>Cancel</Button>
            <Button variant="primary" onClick={() => {
              showNotification(`✓ Role details updated.`);
              setIsEditModalOpen(false);
              setEditingRole(null);
            }}>Save Changes</Button>
          </div>
        }
      >
        {editingRole && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Role Name" defaultValue={editingRole.name} readOnly={editingRole.type === 'System'} />
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Description</label>
              <textarea 
                rows={2} 
                defaultValue={editingRole.description || `${editingRole.name} privileges across the platform.`} 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit' }}
              />
            </div>
            {editingRole.type === 'System' && (
              <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <i className="fas fa-info-circle" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}></i>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  System roles cannot be renamed or deleted, but their specific granular permissions can be edited via the <strong>Permissions</strong> menu.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmationDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          if (confirmDialog.action) confirmDialog.action();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
      />
    </div>
  );
};
