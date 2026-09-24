import React, { useState, useEffect, useMemo } from 'react';
import { Button, Badge, Modal, Input } from '../../components/ui';
import { ModeratorService } from '../../services/moderatorService';
import { BorrowingStorageService } from '../../utils/borrowingStorageService';
import { FineStorageService } from '../../utils/fineStorageService';
import './Moderator.css';

export const ModStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [finesList, setFinesList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterEligibility, setFilterEligibility] = useState('All');

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [notification, setNotification] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const [studentsData, borrowingsData, finesData] = await Promise.all([
        ModeratorService.getStudents().catch(() => []),
        ModeratorService.getBorrowings().catch(() => []),
        ModeratorService.getFines().catch(() => [])
      ]);

      const localBorrowings = BorrowingStorageService.getBorrowings();
      const localFines = FineStorageService.getFines();

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setBorrowings([...(Array.isArray(borrowingsData) ? borrowingsData : []), ...localBorrowings]);
      setFinesList([...(Array.isArray(finesData) ? finesData : []), ...localFines]);
    } catch (err) {
      console.error("Failed to load students:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Dynamically calculate active borrowings count for a student
  const getStudentBorrowCount = (student: any): number => {
    let count = student.currentlyBorrowed || 0;

    const studentName = (student.name || '').toLowerCase().trim();
    const studentEmail = (student.email || '').toLowerCase().trim();
    const studentId = (student.studentId || student.id || '').toLowerCase().trim();

    const matchedActive = borrowings.filter((b: any) => {
      const isNotReturned = b.status !== 'RETURNED' && b.status !== 'COMPLETED';
      if (!isNotReturned) return false;

      const borrowerName = (b.studentName || b.user?.name || '').toLowerCase().trim();
      const borrowerEmail = (b.studentEmail || b.user?.email || '').toLowerCase().trim();
      const borrowerId = (b.studentId || b.user?.id || b.user?.studentId || '').toLowerCase().trim();

      const matchesEmail = Boolean(studentEmail && borrowerEmail && (studentEmail === borrowerEmail || borrowerEmail.includes(studentEmail)));
      const matchesId = Boolean(studentId && borrowerId && (studentId === borrowerId || borrowerId.includes(studentId)));
      const matchesName = Boolean(studentName && borrowerName && (studentName === borrowerName || borrowerName.includes(studentName)));

      return matchesEmail || matchesId || matchesName;
    });

    return Math.max(count, matchedActive.length);
  };

  // Dynamically calculate unpaid fines total for a student
  const getStudentUnpaidFines = (student: any): number => {
    let backendTotal = student.fines || 0;

    const studentName = (student.name || '').toLowerCase().trim();
    const studentEmail = (student.email || '').toLowerCase().trim();
    const studentId = (student.studentId || student.id || '').toLowerCase().trim();

    const matchedUnpaid = finesList.filter((f: any) => {
      const isUnpaid = f.status === 'UNPAID' || f.status === 'PENDING' || f.status === 'Unpaid';
      if (!isUnpaid) return false;

      const fName = (f.studentName || f.user?.name || '').toLowerCase().trim();
      const fEmail = (f.studentEmail || f.user?.email || '').toLowerCase().trim();
      const fId = (f.studentId || f.user?.id || f.user?.studentId || '').toLowerCase().trim();

      const matchesEmail = Boolean(studentEmail && fEmail && (studentEmail === fEmail || fEmail.includes(studentEmail)));
      const matchesId = Boolean(studentId && fId && (studentId === fId || fId.includes(studentId)));
      const matchesName = Boolean(studentName && fName && (studentName === fName || fName.includes(studentName)));

      return matchesEmail || matchesId || matchesName;
    });

    const localTotal = matchedUnpaid.reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
    return Math.max(backendTotal, localTotal);
  };

  // Departments list for dropdown filter
  const departmentsList = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.department) set.add(s.department);
    });
    return ['All', ...Array.from(set)];
  }, [students]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const displayId = (student.studentId || student.id || '').toLowerCase();
      const name = (student.name || '').toLowerCase();
      const email = (student.email || '').toLowerCase();
      const dept = (student.department || '').toLowerCase();
      const term = search.toLowerCase();

      const matchesSearch = name.includes(term) || displayId.includes(term) || email.includes(term) || dept.includes(term);
      const matchesDept = filterDepartment === 'All' || student.department === filterDepartment;
      
      const unpaid = getStudentUnpaidFines(student);
      const isRestricted = unpaid > 0;
      let matchesEligibility = true;
      if (filterEligibility === 'Eligible') matchesEligibility = !isRestricted;
      else if (filterEligibility === 'Restricted') matchesEligibility = isRestricted;

      return matchesSearch && matchesDept && matchesEligibility;
    });
  }, [students, search, filterDepartment, filterEligibility, borrowings, finesList]);

  const handleSaveEdit = () => {
    if (!editFormData.id) return;
    setStudents(prev => prev.map(s => s.id === editFormData.id ? { ...s, ...editFormData } : s));
    setIsEditModalOpen(false);
    setSelectedStudent(null);
    showNotification(`Student profile for "${editFormData.name}" updated successfully!`);
  };

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

      <div className="mod-card-header">
        <div>
          <h1 className="mod-card-title">Student Management</h1>
          <p style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>Manage student library accounts, credentials, and eligibility.</p>
        </div>
      </div>

      <div className="mod-card">
        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 340, flex: 1, minWidth: 240 }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: 12, color: 'var(--bg-secondary-text)' }}></i>
            <input 
              type="text" 
              placeholder="Search Student ID, Name, Email, or Department..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              value={filterDepartment} 
              onChange={e => setFilterDepartment(e.target.value)}
              style={{ padding: '0 16px', height: '42px', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-border)', outline: 'none', background: 'white', color: 'var(--text-primary)', fontSize: '0.875rem' }}
            >
              <option value="All">All Departments</option>
              {departmentsList.filter(d => d !== 'All').map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select 
              value={filterEligibility} 
              onChange={e => setFilterEligibility(e.target.value)}
              style={{ padding: '0 16px', height: '42px', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-border)', outline: 'none', background: 'white', color: 'var(--text-primary)', fontSize: '0.875rem' }}
            >
              <option value="All">All Statuses</option>
              <option value="Eligible">Eligible Borrowers</option>
              <option value="Restricted">Restricted (Unpaid Fines)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>Loading student records...</p>
        ) : filteredStudents.length === 0 ? (
          <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>No students found matching your criteria.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="mod-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Department</th>
                  <th>Eligibility</th>
                  <th>Active Borrowings</th>
                  <th>Unpaid Fines</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const studentDisplayId = student.studentId || student.id;
                  const activeCount = getStudentBorrowCount(student);
                  const unpaidFines = getStudentUnpaidFines(student);
                  const isRestricted = unpaidFines > 0;

                  return (
                    <tr key={student.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-accent-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700 }}>
                            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{student.name}</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a', fontSize: '0.8125rem' }}>
                          {studentDisplayId}
                        </code>
                      </td>
                      <td>{student.department || 'General'}</td>
                      <td>
                        <Badge variant={isRestricted ? 'error' : 'success'} size="sm">
                          {isRestricted ? 'Restricted' : 'Eligible'}
                        </Badge>
                      </td>
                      <td>
                        <span style={{ fontWeight: activeCount > 0 ? 700 : 400, color: activeCount > 0 ? 'var(--bg-accent-blue, #0284c7)' : 'inherit' }}>
                          {activeCount} {activeCount === 1 ? 'book' : 'books'}
                        </span>
                      </td>
                      <td style={{ color: isRestricted ? 'var(--bg-error, #ef4444)' : 'inherit', fontWeight: isRestricted ? 700 : 400 }}>
                        ${unpaidFines.toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="View Profile"
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsViewModalOpen(true);
                            }}
                          >
                            <i className="fas fa-eye"></i> View
                          </Button>

                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="Edit Profile"
                            onClick={() => {
                              setSelectedStudent(student);
                              setEditFormData({
                                id: student.id,
                                name: student.name || '',
                                studentId: studentDisplayId,
                                email: student.email || '',
                                department: student.department || 'Computer Science',
                                phone: student.phone || ''
                              });
                              setIsEditModalOpen(true);
                            }}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Profile Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setSelectedStudent(null); }}
        title="Student Profile & Account Overview"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="primary" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        }
      >
        {selectedStudent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-accent-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700 }}>
                {selectedStudent.name ? selectedStudent.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{selectedStudent.name}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{selectedStudent.email}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>STUDENT ID</label>
                <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontWeight: 700, display: 'inline-block', marginTop: '4px' }}>
                  {selectedStudent.studentId || selectedStudent.id}
                </code>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DEPARTMENT</label>
                <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{selectedStudent.department || 'General'}</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PHONE NUMBER</label>
                <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{selectedStudent.phone || 'N/A'}</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ELIGIBILITY STATUS</label>
                <Badge variant={getStudentUnpaidFines(selectedStudent) > 0 ? 'error' : 'success'} size="sm" style={{ marginTop: '4px' }}>
                  {getStudentUnpaidFines(selectedStudent) > 0 ? 'Restricted' : 'Eligible for Borrowing'}
                </Badge>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
              <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>CURRENT ACTIVE BORROWINGS</p>
                <p style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#1d4ed8' }}>
                  {getStudentBorrowCount(selectedStudent)} Books
                </p>
              </div>

              <div style={{ padding: '12px', background: getStudentUnpaidFines(selectedStudent) > 0 ? '#fef2f2' : '#f0fdf4', borderRadius: '6px', border: `1px solid ${getStudentUnpaidFines(selectedStudent) > 0 ? '#fca5a5' : '#bbf7d0'}` }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: getStudentUnpaidFines(selectedStudent) > 0 ? '#991b1b' : '#166534', fontWeight: 600 }}>UNPAID FINES BALANCE</p>
                <p style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 800, color: getStudentUnpaidFines(selectedStudent) > 0 ? '#dc2626' : '#15803d' }}>
                  ${getStudentUnpaidFines(selectedStudent).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedStudent(null); }}
        title="Edit Student Account Details"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input 
            label="Full Name" 
            value={editFormData.name || ''} 
            onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} 
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input 
              label="Student ID" 
              value={editFormData.studentId || ''} 
              onChange={e => setEditFormData({ ...editFormData, studentId: e.target.value })} 
            />
            <Input 
              label="University Email" 
              type="email"
              value={editFormData.email || ''} 
              onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input 
              label="Department" 
              value={editFormData.department || ''} 
              onChange={e => setEditFormData({ ...editFormData, department: e.target.value })} 
            />
            <Input 
              label="Phone Number" 
              value={editFormData.phone || ''} 
              onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })} 
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
