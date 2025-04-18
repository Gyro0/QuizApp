<template>
  <div class="admin-user-list">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center my-5">
      <b-spinner variant="primary" label="Loading users..."></b-spinner>
      <p class="mt-2">Loading users...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    
    <!-- User List Content -->
    <div v-else>
      <!-- Search Input -->
      <div class="mb-4">
        <b-input-group>
          <b-form-input
            v-model="searchQuery"
            placeholder="Search users by name or email..."
            trim
          ></b-form-input>
          <b-input-group-append>
            <b-button variant="outline-secondary" @click="searchQuery = ''">Clear</b-button>
          </b-input-group-append>
        </b-input-group>
      </div>
      
      <!-- Users Table -->
      <b-table
        :items="filteredUsers"
        :fields="tableFields"
        striped
        hover
        responsive
        show-empty
        empty-text="No users found"
      >
        <!-- Custom Cell: User Display Name -->
        <template #cell(displayName)="data">
          <div class="d-flex align-items-center">
            <b-avatar :text="getUserInitials(data.item)" class="mr-2"></b-avatar>
            <div>
              <div>{{ data.item.displayName || 'No name' }}</div>
              <div class="text-muted small">{{ data.item.email }}</div>
            </div>
          </div>
        </template>
        
        <!-- Custom Cell: Role -->
        <template #cell(role)="data">
          <b-badge
            :variant="data.item.role === 'admin' ? 'danger' : 'primary'"
            class="mr-1"
          >
            {{ data.item.role || 'user' }}
          </b-badge>
          <b-button 
            v-if="data.item.id !== currentUser.uid"
            size="sm" 
            variant="outline-secondary" 
            @click="openRoleModal(data.item)"
            title="Change Role"
          >
            Change
          </b-button>
        </template>
        
        <!-- Custom Cell: Creation Date -->
        <template #cell(createdAt)="data">
          {{ formatDate(data.item.createdAt) }}
        </template>
        
        <!-- Custom Cell: Actions -->
        <template #cell(actions)="data">
          <b-button-group size="sm">
            <b-button 
              variant="outline-primary" 
              @click="viewUserStats(data.item)"
              title="View Statistics"
            >
              Stats
            </b-button>
            <b-button 
              variant="outline-danger" 
              @click="confirmDeleteUser(data.item)"
              :disabled="data.item.id === currentUser.uid"
              title="Delete User"
            >
              Delete
            </b-button>
          </b-button-group>
        </template>
      </b-table>
    </div>
    
    <!-- Define the modals directly in the template -->
    <!-- Role Change Modal -->
    <b-modal
      v-model="showRoleModal"
      title="Change User Role"
      @ok="updateUserRole(selectedRole)"
      ok-title="Save"
    >
      <template v-if="selectedUser">
        <p>Change role for user: <strong>{{ selectedUser.displayName }}</strong></p>
        
        <b-form-group label="Select Role">
          <b-form-select
            v-model="selectedRole"
            :options="roleOptions"
          ></b-form-select>
        </b-form-group>
      </template>
    </b-modal>
    
    <!-- User Delete Modal -->
    <b-modal
      v-model="showDeleteModal"
      title="Delete User"
      ok-variant="danger"
      ok-title="Delete"
      @ok="deleteUser"
    >
      <template v-if="selectedUser">
        <p>Are you sure you want to delete the user <strong>{{ selectedUser.displayName }}</strong>?</p>
        <p class="text-danger">This action cannot be undone.</p>
      </template>
    </b-modal>
    
    <!-- User Stats Modal -->
    <b-modal
      v-model="showStatsModal"
      title="User Statistics"
      size="lg"
      ok-only
    >
      <template v-if="selectedUser">
        <h4>{{ selectedUser.displayName }}'s Statistics</h4>
        
        <div v-if="loadingStats" class="text-center my-4">
          <b-spinner variant="primary"></b-spinner>
        </div>
        
        <div v-else>
          <b-list-group class="mb-4">
            <b-list-group-item class="d-flex justify-content-between">
              <span>Quizzes Taken</span>
              <b-badge variant="primary">{{ userStats.quizzesTaken }}</b-badge>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between">
              <span>Average Score</span>
              <b-badge variant="success">{{ userStats.averageScore }}%</b-badge>
            </b-list-group-item>
          </b-list-group>
          
          <h5>Recent Scores</h5>
          <div v-if="userStats.recentScores.length === 0" class="text-center p-3 bg-light">
            No quiz attempts yet
          </div>
          <b-table v-else :items="userStats.recentScores" :fields="scoreTableFields" striped>
            <template #cell(timestamp)="data">
              {{ formatDate(data.item.timestamp) }}
            </template>
          </b-table>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useFirestore } from '@/composables/useFirestore';
import { useAuth } from '@/composables/useAuth';
import { useLeaderboard } from '@/composables/useLeaderboard';

export default {
  name: 'AdminUserList',
  setup() {
    // Composables
    const { currentUser } = useAuth();
    const usersFirestore = useFirestore('users');
    const { fetchUserBestScores } = useLeaderboard();
    
    // Component State
    const users = ref([]);
    const isLoading = ref(true);
    const error = ref(null);
    const searchQuery = ref('');
    
    // Modal State
    const showRoleModal = ref(false);
    const showDeleteModal = ref(false);
    const showStatsModal = ref(false);
    const selectedUser = ref(null);
    const selectedRole = ref('user');
    const loadingStats = ref(false);
    const userStats = ref({
      quizzesTaken: 0,
      averageScore: 0,
      totalScore: 0,
      recentScores: []
    });
    
    // Configuration
    const roleOptions = [
      { value: 'user', text: 'Regular User' },
      { value: 'admin', text: 'Administrator' }
    ];
    
    const tableFields = [
      { key: 'displayName', label: 'User', sortable: true },
      { key: 'role', label: 'Role', sortable: true },
      { key: 'createdAt', label: 'Joined', sortable: true },
      { key: 'actions', label: 'Actions' }
    ];
    
    const scoreTableFields = [
      { key: 'quizTitle', label: 'Quiz' },
      { key: 'score', label: 'Score' },
      { key: 'timestamp', label: 'Date' }
    ];
    
    // Computed Properties
    const filteredUsers = computed(() => {
      if (!searchQuery.value) return users.value;
      const query = searchQuery.value.toLowerCase();
      return users.value.filter(user => 
        (user.displayName?.toLowerCase().includes(query)) ||
        (user.email?.toLowerCase().includes(query))
      );
    });
    
    // Methods
    const loadUsers = async () => {
      isLoading.value = true;
      error.value = null;
      try {
        // Fetch users ordered by display name
        users.value = await usersFirestore.getItems([
          { name: 'orderBy', field: 'displayName', direction: 'asc' }
        ]);
      } catch (err) {
        console.error('Error loading users:', err);
        error.value = err.message || 'Failed to load users.';
      } finally {
        isLoading.value = false;
      }
    };
    
    const openRoleModal = (user) => {
      selectedUser.value = user;
      selectedRole.value = user.role || 'user'; // Default to 'user' if role is missing
      showRoleModal.value = true;
    };
    
    const updateUserRole = async (newRole) => {
      if (!selectedUser.value) return;
      try {
        await usersFirestore.updateItem(selectedUser.value.id, { role: newRole });
        // Update local user data for immediate UI feedback
        const userIndex = users.value.findIndex(u => u.id === selectedUser.value.id);
        if (userIndex !== -1) {
          users.value[userIndex].role = newRole;
        }
        showRoleModal.value = false; // Close modal on success
      } catch (err) {
        console.error('Error updating user role:', err);
        error.value = err.message || 'Failed to update role.'; // Consider showing error in modal
      }
    };
    
    const confirmDeleteUser = (user) => {
      selectedUser.value = user;
      showDeleteModal.value = true;
    };
    
    const deleteUser = async () => {
      // Prevent deleting the currently logged-in user
      if (!selectedUser.value || selectedUser.value.id === currentUser.value?.uid) return;
      
      try {
        await usersFirestore.deleteItem(selectedUser.value.id);
        // Remove user from the local list
        users.value = users.value.filter(u => u.id !== selectedUser.value.id);
        showDeleteModal.value = false; // Close modal on success
      } catch (err) {
        console.error('Error deleting user:', err);
        error.value = err.message || 'Failed to delete user.'; // Consider showing error in modal
      }
    };
    
    const viewUserStats = async (user) => {
      selectedUser.value = user;
      showStatsModal.value = true;
      loadingStats.value = true;
      userStats.value = { quizzesTaken: 0, averageScore: 0, totalScore: 0, recentScores: [] }; // Reset stats
      
      try {
        const scores = await fetchUserBestScores(user.id);
        
        // Calculate statistics
        const totalScore = scores.reduce((sum, score) => sum + (score.score || 0), 0);
        const quizzesTaken = scores.length;
        const averageScore = quizzesTaken > 0 
          ? Math.round(totalScore / quizzesTaken) 
          : 0;
        
        userStats.value = {
          quizzesTaken,
          averageScore,
          totalScore,
          recentScores: scores.slice(0, 10) // Get 10 most recent scores
        };
      } catch (err) {
        console.error('Error loading user stats:', err);
      } finally {
        loadingStats.value = false;
      }
    };
    
    const getUserInitials = (user) => {
      if (!user || !user.displayName) return '?';
      
      const names = user.displayName.split(' ');
      if (names.length === 1) return names[0].charAt(0).toUpperCase();
      
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };
    
    const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A';
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    };
    
    onMounted(loadUsers);
    
    return {
      users,
      currentUser,
      isLoading,
      error,
      searchQuery,
      filteredUsers,
      tableFields,
      scoreTableFields,
      showRoleModal,
      showDeleteModal,
      showStatsModal,
      selectedUser,
      selectedRole,
      roleOptions,
      loadingStats,
      userStats,
      openRoleModal,
      updateUserRole,
      confirmDeleteUser,
      deleteUser,
      viewUserStats,
      getUserInitials,
      formatDate
    };
  }
};
</script>

<style scoped>
.user-stats {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}
</style>