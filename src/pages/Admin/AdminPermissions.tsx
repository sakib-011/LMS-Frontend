import React, { useState } from 'react';
import { Button } from '../../components/ui';
import './Admin.css';

const ROLES = [
  { id: 'ROLE_ADMIN', name: 'Administrator' },
  { id: 'ROLE_MODERATOR', name: 'Moderator' },
  { id: 'ROLE_STUDENT', name: 'Student' }
];

const RESOURCES = [
  'Books', 'Students', 'Borrowing', 'Returns', 'Reservations', 'Requests', 
  'Fines', 'Digital Library', 'Reports', 'Users', 'Roles', 'Settings', 'Audit Logs'
];

const ACTIONS = ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Export'];

// Generate a matrix state with all permissions allowed
const generateInitialMatrix = () => {
  const matrix: Record<string, Record<string, boolean>> = {};
  RESOURCES.forEach(r => {
    matrix[r] = {};
    ACTIONS.forEach(a => {
      matrix[r][a] = true;
    });
  });
  return matrix;
};

export const AdminPermissions: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState(ROLES[0].id);
  const [matrix, setMatrix] = useState(generateInitialMatrix());

  const togglePermission = (resource: string, action: string) => {
    setMatrix(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: !prev[resource][action]
      }
    }));
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Permission Matrix</h1>
          <p className="admin-subtitle">Granular access control mapping for roles and resources</p>
        </div>
        <Button variant="primary" icon="fas fa-save" onClick={() => alert('Permissions saved successfully!')}>Save Changes</Button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Role Selector Header */}
        <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--bg-border)', display: 'flex', gap: 'var(--space-4)', background: 'var(--bg-background)' }}>
          {ROLES.map(role => (
            <button 
              key={role.id}
              onClick={() => { setSelectedRole(role.id); setMatrix(generateInitialMatrix()); }}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                cursor: 'pointer',
                background: selectedRole === role.id ? '#4f46e5' : 'transparent',
                color: selectedRole === role.id ? 'white' : 'var(--bg-secondary-text)',
                transition: 'all 0.2s'
              }}
            >
              {role.name}
            </button>
          ))}
        </div>

        {/* Matrix Grid */}
        <div className="admin-table-wrapper" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table className="admin-table" style={{ margin: 0 }}>
            <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <tr>
                <th style={{ minWidth: 200, background: 'rgba(99, 102, 241, 0.05)' }}>Resource / Module</th>
                {ACTIONS.map(action => (
                  <th key={action} style={{ textAlign: 'center', background: 'rgba(99, 102, 241, 0.05)' }}>{action}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RESOURCES.map(resource => (
                <tr key={resource}>
                  <td style={{ fontWeight: 600, color: '#1e1b4b', borderRight: '1px solid var(--bg-border)' }}>
                    {resource}
                  </td>
                  {ACTIONS.map(action => (
                    <td key={`${resource}-${action}`} style={{ textAlign: 'center', padding: '12px' }}>
                      <label style={{ display: 'inline-flex', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={matrix[resource][action]}
                          onChange={() => togglePermission(resource, action)}
                          style={{
                            width: 20, height: 20, 
                            cursor: 'pointer',
                            accentColor: '#4f46e5'
                          }}
                        />
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div style={{ marginTop: 'var(--space-6)' }}>
        <h3 style={{ fontSize: '1rem', color: '#1e1b4b', marginBottom: 'var(--space-3)' }}>User-Specific Permission Overrides</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--bg-secondary-text)', marginBottom: 'var(--space-4)' }}>
          In specific cases, you can apply overrides (Allow or Deny) to individual users regardless of their role. This is managed in the <a href="/admin/users" style={{ color: '#4f46e5' }}>User Management</a> security settings.
        </p>
      </div>
    </div>
  );
};
