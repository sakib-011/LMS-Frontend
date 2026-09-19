import React, { useState, useEffect } from 'react';
import { Button, Badge } from '../../components/ui';
import { ModeratorService } from '../../services/moderatorService';
import './Moderator.css';

export const ModStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    ModeratorService.getStudents()
      .then((data: any) => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mod-card-header">
        <div>
          <h1 className="mod-card-title">Student Management</h1>
          <p style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>Manage student library accounts and eligibility.</p>
        </div>
      </div>

      <div className="mod-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="mod-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>ID</th>
                <th>Department</th>
                <th>Eligibility</th>
                <th>Active Borrowings</th>
                <th>Unpaid Fines</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-accent-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>
                        <i className="fas fa-user"></i>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{student.name}</span>
                    </div>
                  </td>
                  <td>{student.id}</td>
                  <td>{student.department || 'General'}</td>
                  <td>
                    <Badge variant={(student.fines || 0) > 0 ? 'error' : 'success'} size="sm">
                      {(student.fines || 0) > 0 ? 'Restricted' : 'Eligible'}
                    </Badge>
                  </td>
                  <td>{student.currentlyBorrowed || 0} books</td>
                  <td style={{ color: (student.fines || 0) > 0 ? 'var(--bg-error)' : 'inherit' }}>
                    ${(student.fines || 0).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" title="View Profile"><i className="fas fa-eye"></i></Button>
                      <Button size="sm" variant="outline" title="Manage Fines"><i className="fas fa-money-bill"></i></Button>
                      <Button size="sm" variant="outline" title="Edit Profile"><i className="fas fa-edit"></i></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
