import React, { useState } from 'react';
import { Button, Badge, Modal, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import './Student.css';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  
  const [student, setStudent] = useState({
    name: user?.name || 'Student User',
    email: user?.email || 'student@university.edu',
    id: user?.id || '2023100000440',
    department: 'Computer Science & Engineering',
    phone: '+1 234 567 8900',
    joinDate: '2023-09-01',
    membershipExpiry: '2027-06-30',
    totalBorrowed: 12,
    currentlyBorrowed: 2,
    totalReviews: 4,
    fines: 0.00
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: student.name,
    email: student.email,
    phone: student.phone,
    department: student.department,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleOpenEdit = () => {
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      department: student.department,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrorMsg(null);
    setIsEditModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation checks
    if (!formData.name.trim()) {
      setErrorMsg('Full Name cannot be empty.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg('Email address cannot be empty.');
      return;
    }
    if (!formData.currentPassword) {
      setErrorMsg('Please enter your Current Password to authenticate changes.');
      return;
    }

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setErrorMsg('New Password must be at least 6 characters long.');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setErrorMsg('New Passwords do not match.');
        return;
      }
    }

    // Success update
    setStudent(prev => ({
      ...prev,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
    }));
    setIsEditModalOpen(false);
    setNotification('Profile updated and authenticated successfully!');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div>
      <div className="sl-page-header">
        <h1 className="sl-page-title">My Profile</h1>
      </div>

      {notification && (
        <div style={{
          backgroundColor: '#e6f4ea',
          color: '#137333',
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-4)',
          border: '1px solid #ceead6',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="fas fa-check-circle"></i>
          {notification}
        </div>
      )}

      <div className="sl-card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="std-profile-header">
          <div className="std-profile-avatar">
            <i className="fas fa-user-graduate"></i>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 var(--space-1)', fontFamily: 'var(--font-serif)', fontSize: '1.75rem' }}>{student.name}</h2>
            <p style={{ color: 'var(--bg-secondary-text)', margin: '0 0 var(--space-3)' }}>{student.department} · {student.id}</p>
            <Badge variant="success">Active Member</Badge>
          </div>
          <Button variant="outline" icon="fas fa-edit" size="sm" onClick={handleOpenEdit}>
            Edit Profile
          </Button>
        </div>

        <div className="std-profile-stats">
          <div className="std-profile-stat">
            <span className="std-profile-stat-number">{student.totalBorrowed}</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--bg-secondary-text)' }}>Total Borrowed</span>
          </div>
          <div className="std-profile-stat">
            <span className="std-profile-stat-number">{student.currentlyBorrowed}</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--bg-secondary-text)' }}>Currently Borrowed</span>
          </div>
          <div className="std-profile-stat">
            <span className="std-profile-stat-number">{student.totalReviews}</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--bg-secondary-text)' }}>Reviews Written</span>
          </div>
          <div className="std-profile-stat">
            <span className="std-profile-stat-number" style={{ color: student.fines > 0 ? 'var(--bg-error)' : 'var(--bg-success)' }}>
              ${student.fines.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--bg-secondary-text)' }}>Outstanding Fines</span>
          </div>
        </div>
      </div>

      <div className="sl-card">
        <h3 className="sl-card-title">Account Information</h3>
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {[
            { label: 'Full Name', value: student.name, icon: 'fas fa-user' },
            { label: 'Email', value: student.email, icon: 'fas fa-envelope' },
            { label: 'Student ID', value: student.id, icon: 'fas fa-id-card' },
            { label: 'Department', value: student.department, icon: 'fas fa-university' },
            { label: 'Phone', value: student.phone, icon: 'fas fa-phone' },
            { label: 'Member Since', value: student.joinDate, icon: 'fas fa-calendar' },
            { label: 'Membership Expiry', value: student.membershipExpiry, icon: 'fas fa-clock' },
          ].map(field => (
            <div key={field.label} style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--bg-border)' }}>
              <div style={{ width: '2rem', textAlign: 'center', color: 'var(--bg-warm-orange)' }}>
                <i className={field.icon}></i>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--bg-secondary-text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field.label}</p>
                <p style={{ margin: 0, fontWeight: 500 }}>{field.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile Information"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save Changes</Button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {errorMsg && (
            <div style={{
              backgroundColor: '#fce8e6',
              color: '#c5221f',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #fad2cf',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-exclamation-triangle"></i>
              {errorMsg}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-1)' }}>Full Name *</label>
            <Input
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full Name"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-1)' }}>Email Address *</label>
            <Input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email Address"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-1)' }}>Phone Number</label>
            <Input
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Phone Number"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-1)' }}>Department</label>
            <Input
              value={formData.department}
              onChange={e => setFormData({ ...formData, department: e.target.value })}
              placeholder="Department"
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--bg-border)', margin: 'var(--space-2) 0' }} />

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--bg-deep-black)' }}>
              Current Password * (Required for Verification)
            </label>
            <Input
              type="password"
              value={formData.currentPassword}
              onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
              placeholder="Enter current password to save changes"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
              New Password (Optional)
            </label>
            <Input
              type="password"
              value={formData.newPassword}
              onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="Leave blank to keep current password"
            />
          </div>

          {formData.newPassword && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                Confirm New Password *
              </label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                required
              />
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
