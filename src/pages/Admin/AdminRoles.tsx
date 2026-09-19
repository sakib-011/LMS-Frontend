import React, { useState } from 'react';
import { Button, Badge, Modal, Input, ConfirmationDialog } from '../../components/ui';
import './Admin.css';

const ROLES = [
  { id: 'ROLE_ADMIN', name: 'Administrator', type: 'System', users: 5 },
  { id: 'ROLE_MODERATOR', name: 'Moderator', type: 'System', users: 15 },
  { id: 'ROLE_STUDENT', name: 'Student', type: 'System', users: 1200 },
];

export const AdminRoles: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, isDestructive?: boolean}>({ isOpen: false, title: '', message: '' });

  const filteredRoles = ROLES.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Role Management</h1>
          <p className="admin-subtitle">Manage user roles and their associated permissions across BookGrid.</p>
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
                <th>Active Users</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map(role => (
                <tr key={role.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ 
                        width: '36px', height: '36px', 
                        borderRadius: 'var(--radius-md)', 
                        background: role.type === 'System' ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                        color: role.type === 'System' ? 'white' : 'var(--text-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <i className={role.type === 'System' ? 'fas fa-shield-alt' : 'fas fa-user-tag'}></i>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{role.name}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {role.id}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant={role.type === 'System' ? 'secondary' : 'primary'}>{role.type}</Badge>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{role.users.toLocaleString()}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" title="Edit Role" onClick={() => { setEditingRole(role); setIsEditModalOpen(true); }}>
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button size="sm" variant="outline" title="Edit Permissions" onClick={() => setConfirmDialog({
                        isOpen: true, title: 'Edit Permissions', message: `Are you sure you want to modify system permissions for the ${role.name} role? This will affect ${role.users} users.`
                      })}>
                        <i className="fas fa-key"></i>
                      </Button>
                      {role.type !== 'System' && (
                        <Button size="sm" variant="outline" title="Delete Role" onClick={() => setConfirmDialog({
                          isOpen: true, title: 'Delete Role', message: `Are you sure you want to permanently delete the ${role.name} role? You must reassign its ${role.users} users first.`, isDestructive: true
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
          
          {filteredRoles.length === 0 && (
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
            <Button variant="primary" onClick={() => setIsCreateModalOpen(false)}>Create Role</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Role Name" placeholder="e.g. Volunteer Assistant" icon="fas fa-tag" />
          <Input label="Description" placeholder="Briefly describe the purpose of this role..." />
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Base Role Template</label>
            <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
              <option value="student">Student (Read-only Catalog)</option>
              <option value="moderator">Moderator (Manage Books & Returns)</option>
            </select>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>You can fine-tune specific permissions after creation.</p>
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
            <Button variant="primary" onClick={() => { setIsEditModalOpen(false); setEditingRole(null); }}>Save Changes</Button>
          </div>
        }
      >
        {editingRole && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Role Name" defaultValue={editingRole.name} readOnly={editingRole.type === 'System'} />
            <Input label="Description" defaultValue={`${editingRole.name} privileges across the platform.`} />
            {editingRole.type === 'System' && (
              <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <i className="fas fa-info-circle" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}></i>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>System roles cannot be renamed or deleted, but their specific granular permissions can be edited via the Permissions menu.</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmationDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
      />
    </div>
  );
};
