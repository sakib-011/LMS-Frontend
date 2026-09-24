import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui';
import { PermissionStorageService, RESOURCES, ACTIONS } from '../../utils/permissionStorageService';
import './Admin.css';

const ROLES = [
  { id: 'ROLE_ADMIN', name: 'Administrator' },
  { id: 'ROLE_MODERATOR', name: 'Moderator' },
  { id: 'ROLE_STUDENT', name: 'Student' }
];

export const AdminPermissions: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState(ROLES[0].id);
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>({});
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const roleMatrix = PermissionStorageService.getRoleMatrix(selectedRole);
    setMatrix(roleMatrix);
  }, [selectedRole]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const togglePermission = (resource: string, action: string) => {
    setMatrix(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: !prev[resource]?.[action]
      }
    }));
  };

  const handleSavePermissions = () => {
    PermissionStorageService.saveRoleMatrix(selectedRole, matrix);
    const roleObj = ROLES.find(r => r.id === selectedRole);
    showNotification(`✓ Granular Permission Matrix for ${roleObj ? roleObj.name : 'Role'} saved successfully!`);
  };

  const handleSelectAll = (enable: boolean) => {
    const updated: Record<string, Record<string, boolean>> = {};
    RESOURCES.forEach(r => {
      updated[r] = {};
      ACTIONS.forEach(a => {
        updated[r][a] = enable;
      });
    });
    setMatrix(updated);
  };

  const currentRoleName = ROLES.find(r => r.id === selectedRole)?.name || 'Role';

  return (
    <div>
      {/* Toast Notification */}
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
          <h1 className="admin-title">Permission Matrix</h1>
          <p className="admin-subtitle">Granular access control mapping for roles, resources, and administrative actions.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline" onClick={() => handleSelectAll(true)}>Enable All</Button>
          <Button variant="outline" onClick={() => handleSelectAll(false)}>Disable All</Button>
          <Button variant="primary" icon="fas fa-save" onClick={handleSavePermissions}>Save Changes</Button>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Role Selector Header */}
        <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: 'var(--space-4)', background: 'var(--bg-pale-peach)' }}>
          {ROLES.map(role => (
            <button 
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                background: selectedRole === role.id ? 'var(--bg-warm-orange)' : 'white',
                color: selectedRole === role.id ? 'white' : 'var(--text-secondary)',
                boxShadow: selectedRole === role.id ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <i className={role.id === 'ROLE_ADMIN' ? 'fas fa-shield-alt' : role.id === 'ROLE_MODERATOR' ? 'fas fa-user-shield' : 'fas fa-user-graduate'} style={{ marginRight: 6 }}></i>
              {role.name}
            </button>
          ))}
        </div>

        {/* Matrix Grid */}
        <div className="admin-table-wrapper" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table className="admin-table" style={{ margin: 0 }}>
            <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <tr>
                <th style={{ minWidth: 200, background: 'var(--bg-pale-peach)', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  Resource / Module
                </th>
                {ACTIONS.map(action => (
                  <th key={action} style={{ textAlign: 'center', background: 'var(--bg-pale-peach)', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {action}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RESOURCES.map(resource => (
                <tr key={resource}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)', borderRight: '1px solid var(--border-color)' }}>
                    {resource}
                  </td>
                  {ACTIONS.map(action => {
                    const isChecked = matrix[resource]?.[action] ?? false;
                    return (
                      <td key={`${resource}-${action}`} style={{ textAlign: 'center', padding: '12px' }}>
                        <label style={{ display: 'inline-flex', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => togglePermission(resource, action)}
                            style={{
                              width: 20, height: 20, 
                              cursor: 'pointer',
                              accentColor: 'var(--bg-warm-orange)'
                            }}
                          />
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div style={{ marginTop: 'var(--space-6)', background: 'white', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 'var(--space-2)', margin: 0 }}>
          <i className="fas fa-user-lock" style={{ marginRight: 8, color: 'var(--bg-warm-orange)' }}></i>
          User-Specific Permission Overrides ({currentRoleName})
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
          Configured permissions are actively evaluated for all <strong>{currentRoleName}</strong> accounts. You can also apply specific Allow or Deny overrides to individual users in <a href="/admin/users" style={{ color: 'var(--bg-warm-orange)', fontWeight: 600 }}>User Management</a>.
        </p>
      </div>
    </div>
  );
};
