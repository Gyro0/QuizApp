<template>
  <div class="admin-user-management">
    <b-container>
      <h1 class="mb-4">User Management</h1>
      
      <!-- Access Control -->
      <b-alert 
        v-if="!currentUser || !isAdmin" 
        show 
        variant="danger" 
        class="text-center my-5"
      >
        <h4>Access Denied</h4>
        <p>You do not have permission to access this page.</p>
        <b-button variant="primary" to="/">Return to Home</b-button>
      </b-alert>
      
      <!-- Main Content -->
      <b-card v-else>
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>All Users</h2>
          <b-button variant="outline-secondary" to="/admin/dashboard">
            Back to Dashboard
          </b-button>
        </div>
        
        <AdminUserList />
      </b-card>
    </b-container>
  </div>
</template>

<script>
import { useAuth } from '@/composables/useAuth';
import AdminUserList from '@/components/Admin/AdminUserList.vue';

export default {
  name: 'AdminUserManagementView',
  components: { AdminUserList },
  setup() {
    const { currentUser, isAdmin } = useAuth();
    return { currentUser, isAdmin };
  }
};
</script>