import api from './api';

class ActivityService {
  async getRecentActivities(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, v);
    });
    const res = await api.get(`/activities/recent?${params.toString()}`);
    return res.data;
  }

  async getActivityStats(timeRange = '24h') {
    const res = await api.get(`/activities/stats?timeRange=${timeRange}`);
    return res.data;
  }

  async getUserActivities(userId, options = {}) {
    const params = new URLSearchParams(options);
    const res = await api.get(`/activities/user/${userId}?${params.toString()}`);
    return res.data;
  }

  async getBranchActivities(branchId, options = {}) {
    const params = new URLSearchParams(options);
    const res = await api.get(`/activities/branch/${branchId}?${params.toString()}`);
    return res.data;
  }

  async getEntityTimeline(entityType, entityId) {
    const res = await api.get(`/activities/timeline/${entityType}/${entityId}`);
    return res.data;
  }

  // Role-specific activity methods
  async getAdminActivities(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, v);
    });
    const res = await api.get(`/activities/admin?${params.toString()}`);
    return res.data;
  }

  async getSuperadminActivities(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, v);
    });
    const res = await api.get(`/activities/superadmin?${params.toString()}`);
    return res.data;
  }

  async getSupportActivities(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, v);
    });
    const res = await api.get(`/activities/support?${params.toString()}`);
    return res.data;
  }

  async getRoleSpecificStats(timeRange = '24h') {
    const res = await api.get(`/activities/stats/role-specific?timeRange=${timeRange}`);
    return res.data;
  }

  async getRoleSpecificUserActivities(userId, options = {}) {
    const params = new URLSearchParams(options);
    const res = await api.get(`/activities/user/${userId}/role-specific?${params.toString()}`);
    return res.data;
  }

  async getRoleSpecificBranchActivities(branchId, options = {}) {
    const params = new URLSearchParams(options);
    const res = await api.get(`/activities/branch/${branchId}/role-specific?${params.toString()}`);
    return res.data;
  }

  // Helper method to get activities based on user role
  async getActivitiesByRole(userRole, filters = {}) {
    switch (userRole) {
      case 'admin':
        return this.getAdminActivities(filters);
      case 'superadmin':
        return this.getSuperadminActivities(filters);
      case 'support':
        return this.getSupportActivities(filters);
      default:
        return this.getRecentActivities(filters);
    }
  }
}

export default new ActivityService(); 