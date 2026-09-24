import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Select } from '../../components/ui';
import { apiClient } from '../../services/api';
import { ALL_DEPARTMENTS } from '../../utils/departments';
import './Auth.css';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    department: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [customDepartment, setCustomDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const finalDepartment = formData.department === 'Other' ? (customDepartment.trim() || 'General Studies') : formData.department;

    if (!finalDepartment) {
      setError("Please select or specify your department");
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/auth/register', {
        name: formData.fullName,
        studentId: formData.studentId,
        email: formData.email,
        password: formData.password,
        department: finalDepartment,
        phone: formData.phone
      });

      setIsLoading(false);
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.response?.data?.message || err?.response?.data || err?.message || 'Registration failed');
    }
  };

  const departmentOptions = [
    { label: 'Select Department...', value: '' },
    ...ALL_DEPARTMENTS.map(dept => ({ label: dept, value: dept }))
  ];

  return (
    <div className="bg-auth-card">
      <div className="bg-auth-header">
        <h1 className="bg-auth-title">Create Account</h1>
        <p className="bg-auth-subtitle">Join the BookGrid community</p>
      </div>

      {error && (
        <div className="bg-auth-alert bg-auth-alert--error">
          <i className="fas fa-exclamation-circle" style={{ marginTop: '2px' }}></i>
          <span>{error}</span>
        </div>
      )}

      <form className="bg-auth-form" onSubmit={handleRegister}>
        <Input 
          name="fullName"
          label="Full Name" 
          placeholder="John Doe"
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Input 
            name="studentId"
            label="Student ID" 
            placeholder="e.g. 2024001"
            value={formData.studentId}
            onChange={handleChange}
            required
          />
          <Input 
            name="phone"
            label="Phone Number" 
            placeholder="+1 234 567 890"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <Input 
          name="email"
          label="University Email" 
          type="email"
          placeholder="john.doe@university.edu"
          icon="fas fa-envelope"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Select
          name="department"
          label="Department"
          value={formData.department}
          onChange={handleChange}
          required
          options={departmentOptions}
        />

        {formData.department === 'Other' && (
          <Input 
            name="customDepartment"
            label="Custom Department Name"
            placeholder="e.g. Artificial Intelligence & Data Science"
            value={customDepartment}
            onChange={(e) => setCustomDepartment(e.target.value)}
            icon="fas fa-building"
            required
          />
        )}
        
        <Input 
          name="password"
          label="Password" 
          type="password"
          placeholder="Create a password"
          icon="fas fa-lock"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <Input 
          name="confirmPassword"
          label="Confirm Password" 
          type="password"
          placeholder="Confirm your password"
          icon="fas fa-lock"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <Button 
          type="submit" 
          variant="primary" 
          fullWidth 
          disabled={isLoading}
          style={{ marginTop: 'var(--space-4)' }}
        >
          {isLoading ? (
            <><i className="fas fa-circle-notch fa-spin" style={{ marginRight: '8px' }}></i> Creating Account...</>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="bg-auth-footer">
        Already have an account? <Link to="/login" className="bg-auth-link">Sign In</Link>
      </div>
    </div>
  );
};
