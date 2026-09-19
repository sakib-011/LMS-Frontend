import React, { useState, useEffect } from 'react';
import { Button, Badge, Modal, Input, ConfirmationDialog } from '../../components/ui';
import { AdminService, UserManagementItem } from '../../services/adminService';
import './Admin.css';

export const AdminModerators: React.FC = () => {
  const [users, setUsers] = useState<UserManagementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMod, setEditingMod] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, isDestructive?: boolean}>({ isOpen: false, title: '', message: '' });
  
  useEffect(() => {
    AdminService.getUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const moderators = users.filter(u => u.role === 'MODERATOR' || (u.role as string) === 'Moderator');

  const filteredModerators = moderators.filter(u => {
    return (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase());
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
          <h1 className="admin-title">Library Moderators</h1>
          <p className="admin-subtitle">Manage librarian access, assignments, and operational permissions</p>
        </div>
        <Button variant="primary" icon="fas fa-user-tie" onClick={() => setIsAddModalOpen(true)}>Add Moderator</Button>
      </div>

      <div className="admin-card">
        <div style={{ position: 'relative', marginBottom: 'var(--space-6)' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-secondary)' }}></i>
          <input 
            type="text" 
            placeholder="Search moderators by name or email..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
          />
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Moderator Details</th>
                <th>Assigned Branch</th>
                <th>Status</th>
                <th>Last Active</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredModerators.map(mod => (
                <tr key={mod.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--bg-warm-orange)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                        {mod.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{mod.name}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{mod.email} · {mod.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Main Library</span>
                  </td>
                  <td>
                    <Badge variant={getStatusBadge(mod.status)} size="sm">{mod.status}</Badge>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    10 minutes ago
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" title="Edit Permissions" onClick={() => setConfirmDialog({
                        isOpen: true, title: 'Edit Permissions', message: `Are you sure you want to modify system permissions for ${mod.name}?`
                      })}><i className="fas fa-key"></i></Button>
                      <Button size="sm" variant="outline" title="Edit Profile" onClick={() => { setEditingMod(mod); setIsEditModalOpen(true); }}><i className="fas fa-edit"></i></Button>
                      <Button size="sm" variant="outline" title="Revoke Access" onClick={() => setConfirmDialog({
                        isOpen: true, title: 'Revoke Access', message: `Are you sure you want to revoke ${mod.name}'s moderator privileges?`, isDestructive: true
                      })}><i className="fas fa-ban" style={{ color: 'var(--status-error)' }}></i></Button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredModerators.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-secondary)' }}>
                    No moderators found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Moderator"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setIsAddModalOpen(false)}>Add Moderator</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Full Name" placeholder="e.g. Jane Smith" />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Moderator ID" placeholder="e.g. MOD2024" />
            <Input label="Phone Number" type="tel" placeholder="+1 234 567 890" />
          </div>

          <Input label="University Email" type="email" placeholder="e.g. jane@library.edu" icon="fas fa-envelope" />
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Department</label>
            <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
              <option value="">Select Department...</option>
              <option value="cs">Computer Science</option>
              <option value="math">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="literature">Literature</option>
            </select>
          </div>

          <Input label="Password" type="password" placeholder="Create a password" icon="fas fa-lock" />
          <Input label="Confirm Password" type="password" placeholder="Confirm your password" icon="fas fa-lock" />

          <Input label="Assigned Branch" placeholder="e.g. Main Library" icon="fas fa-building" />
        </div>
      </Modal>

      {/* Edit Moderator Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); setEditingMod(null); }}
        title="Edit Moderator Details"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingMod(null); }}>Cancel</Button>
            <Button variant="primary" onClick={() => { setIsEditModalOpen(false); setEditingMod(null); }}>Save Changes</Button>
          </div>
        }
      >
        {editingMod && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Full Name" defaultValue={editingMod.name} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input label="Moderator ID" defaultValue={editingMod.id} readOnly />
              <Input label="Phone Number" type="tel" defaultValue={editingMod.phone} />
            </div>

            <Input label="University Email" type="email" defaultValue={editingMod.email} icon="fas fa-envelope" />
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Department</label>
              <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
                <option value="">Select Department...</option>
                <option value="cs">Computer Science</option>
                <option value="math">Mathematics</option>
                <option value="physics">Physics</option>
                <option value="literature">Literature</option>
              </select>
            </div>

            <Input label="Assigned Branch" defaultValue="Main Library" icon="fas fa-building" />
          </div>
        )}
      </Modal>

      <ConfirmationDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          // Mock action completion
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
      />
    </div>
  );
};
