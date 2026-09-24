// ============================================================
// BookGrid — Role & Granular Permission Storage Service
// ============================================================

export const RESOURCES = [
  'Books', 'Students', 'Borrowing', 'Returns', 'Reservations', 'Requests', 
  'Fines', 'Digital Library', 'Reports', 'Users', 'Roles', 'Settings', 'Audit Logs'
];

export const ACTIONS = ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Export'];

const STORAGE_KEY = 'bookgrid_permission_matrices';

const DEFAULT_MATRICES: Record<string, Record<string, Record<string, boolean>>> = {
  ROLE_ADMIN: (() => {
    const matrix: Record<string, Record<string, boolean>> = {};
    RESOURCES.forEach(r => {
      matrix[r] = {};
      ACTIONS.forEach(a => matrix[r][a] = true);
    });
    return matrix;
  })(),
  ROLE_MODERATOR: (() => {
    const matrix: Record<string, Record<string, boolean>> = {};
    RESOURCES.forEach(r => {
      matrix[r] = {};
      ACTIONS.forEach(a => {
        if (['Users', 'Roles', 'Settings', 'Audit Logs'].includes(r) && ['Delete', 'Edit'].includes(a)) {
          matrix[r][a] = false;
        } else {
          matrix[r][a] = true;
        }
      });
    });
    return matrix;
  })(),
  ROLE_STUDENT: (() => {
    const matrix: Record<string, Record<string, boolean>> = {};
    RESOURCES.forEach(r => {
      matrix[r] = {};
      ACTIONS.forEach(a => {
        if (['Books', 'Digital Library', 'Reservations', 'Requests', 'Fines'].includes(r) && a === 'View') {
          matrix[r][a] = true;
        } else {
          matrix[r][a] = false;
        }
      });
    });
    return matrix;
  })()
};

export const PermissionStorageService = {
  getRoleMatrix: (roleId: string): Record<string, Record<string, boolean>> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[roleId]) return parsed[roleId];
      }
    } catch (e) {}
    return DEFAULT_MATRICES[roleId] || DEFAULT_MATRICES['ROLE_STUDENT'];
  },

  saveRoleMatrix: (roleId: string, matrix: Record<string, Record<string, boolean>>) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : { ...DEFAULT_MATRICES };
      parsed[roleId] = matrix;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (e) {}
  }
};
