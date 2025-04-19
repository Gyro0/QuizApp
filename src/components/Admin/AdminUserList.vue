<template>
  <div class="admin-user-list">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading users...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <!-- User List Content -->
    <div v-else>
      <!-- Search Input -->
      <div class="search-bar">
        <input
          v-model="searchQuery"
          class="input"
          placeholder="Search users by name or email..."
          @keyup.enter.native
        />
        <button class="btn btn-secondary btn-sm" @click="searchQuery = ''">Clear</button>
      </div>

      <!-- Users Table -->
      <div class="user-table-wrapper">
        <table class="user-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>
                <div class="user-info">
                  <div class="avatar">{{ getUserInitials(user) }}</div>
                  <div>
                    <div>{{ user.displayName || 'No name' }}</div>
                    <div class="user-email">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span
                  class="badge"
                  :class="user.role === 'admin' ? 'badge-danger' : 'badge-primary'"
                >
                  {{ user.role || 'user' }}
                </span>
                <button
                  v-if="user.id !== currentUser.uid"
                  class="btn btn-outline-secondary btn-xs ml-1"
                  @click="openRoleModal(user)"
                  title="Change Role"
                >
                  Change
                </button>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <div class="action-group">
                  <button
                    class="btn btn-outline-primary btn-xs"
                    @click="viewUserStats(user)"
                    title="View Statistics"
                  >
                    Stats
                  </button>
                  <button
                    class="btn btn-outline-danger btn-xs"
                    @click="confirmDeleteUser(user)"
                    :disabled="user.id === currentUser.uid"
                    title="Delete User"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="4" class="text-center">No users found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Role Change Modal -->
    <div v-if="showRoleModal" class="modal-backdrop">
      <div class="modal">
        <h3>Change User Role</h3>
        <p>Change role for user: <strong>{{ selectedUser.displayName }}</strong></p>
        <div class="form-group">
          <label>Select Role</label>
          <select v-model="selectedRole" class="input">
            <option v-for="opt in roleOptions" :key="opt.value" :value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showRoleModal = false">Cancel</button>
          <button class="btn btn-primary" @click="updateUserRole(selectedRole)">Save</button>
        </div>
      </div>
    </div>

    <!-- User Delete Modal -->
    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal">
        <h3>Delete User</h3>
        <p>Are you sure you want to delete the user <strong>{{ selectedUser.displayName }}</strong>?</p>
        <p class="text-danger">This action cannot be undone.</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
          <button class="btn btn-danger" @click="deleteUser">Delete</button>
        </div>
      </div>
    </div>

    <!-- User Stats Modal -->
    <div v-if="showStatsModal" class="modal-backdrop">
      <div class="modal modal-lg">
        <h3>User Statistics</h3>
        <h4>{{ selectedUser.displayName }}'s Statistics</h4>
        <div v-if="loadingStats" class="loading-state">
          <div class="spinner"></div>
        </div>
        <div v-else>
          <div class="user-stats">
            <div class="stats-row">
              <div>
                <span class="stats-label">Quizzes Taken</span>
                <span class="badge badge-primary">{{ userStats.quizzesTaken }}</span>
              </div>
              <div>
                <span class="stats-label">Average Score</span>
                <span class="badge badge-success">{{ userStats.averageScore }}%</span>
              </div>
            </div>
            <h5>Recent Scores</h5>
            <div v-if="userStats.recentScores.length === 0" class="empty-state">
              No quiz attempts yet
            </div>
            <table v-else class="score-table">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="score in userStats.recentScores" :key="score.timestamp">
                  <td>{{ score.quizTitle }}</td>
                  <td>{{ score.score }}</td>
                  <td>{{ formatDate(score.timestamp) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="showStatsModal = false">Close</button>
        </div>
      </div>
    </div>
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
    const { currentUser } = useAuth();
    const usersFirestore = useFirestore('users');
    const { fetchUserBestScores } = useLeaderboard();

    const users = ref([]);
    const isLoading = ref(true);
    const error = ref(null);
    const searchQuery = ref('');

    const showRoleModal = ref(false);
    const showDeleteModal = ref(false);
    const showStatsModal = ref(false);
    const selectedUser = ref({});
    const selectedRole = ref('user');
    const loadingStats = ref(false);
    const userStats = ref({
      quizzesTaken: 0,
      averageScore: 0,
      totalScore: 0,
      recentScores: []
    });

    const roleOptions = [
      { value: 'user', text: 'Regular User' },
      { value: 'admin', text: 'Administrator' }
    ];

    const filteredUsers = computed(() => {
      if (!searchQuery.value) return users.value;
      const query = searchQuery.value.toLowerCase();
      return users.value.filter(user =>
        (user.displayName?.toLowerCase().includes(query)) ||
        (user.email?.toLowerCase().includes(query))
      );
    });

    const loadUsers = async () => {
      isLoading.value = true;
      error.value = null;
      try {
        users.value = await usersFirestore.getItems([
          { name: 'orderBy', field: 'displayName', direction: 'asc' }
        ]);
      } catch (err) {
        error.value = err.message || 'Failed to load users.';
      } finally {
        isLoading.value = false;
      }
    };

    const openRoleModal = (user) => {
      selectedUser.value = user;
      selectedRole.value = user.role || 'user';
      showRoleModal.value = true;
    };

    const updateUserRole = async (newRole) => {
      if (!selectedUser.value) return;
      try {
        await usersFirestore.updateItem(selectedUser.value.id, { role: newRole });
        const userIndex = users.value.findIndex(u => u.id === selectedUser.value.id);
        if (userIndex !== -1) {
          users.value[userIndex].role = newRole;
        }
        showRoleModal.value = false;
      } catch (err) {
        error.value = err.message || 'Failed to update role.';
      }
    };

    const confirmDeleteUser = (user) => {
      selectedUser.value = user;
      showDeleteModal.value = true;
    };

    const deleteUser = async () => {
      if (!selectedUser.value || selectedUser.value.id === currentUser.value?.uid) return;
      try {
        await usersFirestore.deleteItem(selectedUser.value.id);
        users.value = users.value.filter(u => u.id !== selectedUser.value.id);
        showDeleteModal.value = false;
      } catch (err) {
        error.value = err.message || 'Failed to delete user.';
      }
    };

    const viewUserStats = async (user) => {
      selectedUser.value = user;
      showStatsModal.value = true;
      loadingStats.value = true;
      userStats.value = { quizzesTaken: 0, averageScore: 0, totalScore: 0, recentScores: [] };
      try {
        const scores = await fetchUserBestScores(user.id);
        const totalScore = scores.reduce((sum, score) => sum + (score.score || 0), 0);
        const quizzesTaken = scores.length;
        const averageScore = quizzesTaken > 0
          ? Math.round(totalScore / quizzesTaken)
          : 0;
        userStats.value = {
          quizzesTaken,
          averageScore,
          totalScore,
          recentScores: scores.slice(0, 10)
        };
      } catch (err) {
        // silent
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
.admin-user-list {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 0;
}
.loading-state {
  text-align: center;
  margin: 3rem 0;
}
.spinner {
  display: inline-block;
  width: 2em;
  height: 2em;
  border: 3px solid #eee;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-bottom: 1rem;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.alert {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.95rem;
}
.alert-danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
.search-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.input {
  flex: 1;
  padding: 0.6rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 1rem;
  background: #fafbfc;
  transition: border 0.2s;
}
.input:focus {
  border-color: var(--primary-color, #007bff);
  outline: none;
}
.btn {
  padding: 0.5rem 1.1rem;
  border-radius: 4px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-sm {
  font-size: 0.95rem;
  padding: 0.3rem 0.7rem;
}
.btn-xs {
  font-size: 0.9rem;
  padding: 0.2rem 0.5rem;
}
.btn-primary {
  background: var(--primary-color, #007bff);
  color: #fff;
}
.btn-secondary {
  background: #6c757d;
  color: #fff;
}
.btn-danger {
  background: #dc3545;
  color: #fff;
}
.btn-outline-primary {
  background: #fff;
  color: #007bff;
  border: 1px solid #007bff;
}
.btn-outline-primary:hover {
  background: #007bff;
  color: #fff;
}
.btn-outline-danger {
  background: #fff;
  color: #dc3545;
  border: 1px solid #dc3545;
}
.btn-outline-danger:hover {
  background: #dc3545;
  color: #fff;
}
.btn-outline-secondary {
  background: #fff;
  color: #6c757d;
  border: 1px solid #6c757d;
}
.btn-outline-secondary:hover {
  background: #6c757d;
  color: #fff;
}
.action-group {
  display: flex;
  gap: 0.5rem;
}
.user-table-wrapper {
  overflow-x: auto;
}
.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
}
.user-table th,
.user-table td {
  border: 1px solid #dee2e6;
  padding: 0.75rem;
  text-align: left;
  vertical-align: middle;
}
.user-table th {
  background: #f8f9fa;
  font-weight: 600;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #e9ecef;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
}
.user-email {
  color: #6c757d;
  font-size: 0.95rem;
}
.badge {
  display: inline-block;
  padding: 0.25em 0.7em;
  font-size: 0.95em;
  border-radius: 0.25em;
  margin-right: 0.3em;
}
.badge-primary {
  background: #007bff;
  color: #fff;
}
.badge-danger {
  background: #dc3545;
  color: #fff;
}
.badge-success {
  background: #28a745;
  color: #fff;
}
.text-danger {
  color: #dc3545;
}
.text-center {
  text-align: center;
}
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  min-width: 320px;
  max-width: 95vw;
  box-shadow: 0 2px 16px rgba(0,0,0,0.12);
}
.modal-lg {
  max-width: 700px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
.user-stats {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 1.5rem;
}
.stats-row {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}
.stats-label {
  font-weight: 500;
  margin-right: 0.5rem;
}
.score-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.score-table th,
.score-table td {
  border: 1px solid #dee2e6;
  padding: 0.5rem;
  text-align: left;
}
.score-table th {
  background: #f8f9fa;
}
.empty-state {
  text-align: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 6px;
  color: #6c757d;
}
@media (max-width: 700px) {
  .modal-lg {
    padding: 1rem;
  }
  .stats-row {
    flex-direction: column;
    gap: 1rem;
  }
}
@media (max-width: 600px) {
  .admin-user-list {
    padding: 1rem 0.2rem;
  }
  .user-table th, .user-table td {
    padding: 0.5rem;
  }
}
</style>