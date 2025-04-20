<template>
  <div class="admin-user-management container">
    <h1 class="title">User Management</h1>

    <div v-if="!currentUser || !isAdmin" class="access-denied">
      <div class="alert alert-danger">
        <h4>Access Denied</h4>
        <p>You do not have permission to access this page.</p>
      </div>
      <button class="btn btn-primary" @click="$router.push('/')">Return to Home</button>
    </div>

    <div v-else>
      <div class="user-list">
        <table class="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.displayName }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>
                <button class="btn btn-primary btn-sm" @click="openEditModal(user)">Edit</button>
                <button class="btn btn-danger btn-sm" @click="confirmDeleteUser(user)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="modal-backdrop">
      <div class="modal">
        <h3>Edit User</h3>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <div class="form-group">
          <label>Display Name</label>
          <input type="text" v-model="editingUser.displayName" class="input">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="text" v-model="editingUser.email" disabled class="input">
        </div>
        <div class="form-group">
          <label>Role</label>
          <select v-model="editingUser.role" class="input">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showEditModal = false">Cancel</button>
          <button class="btn btn-primary" @click="saveUser">Save</button>
        </div>
      </div>
    </div>

    <!-- Delete User Modal -->
    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal">
        <h3>Delete User</h3>
        <p>Are you sure you want to delete the user <strong>{{ userToDelete?.displayName }}</strong>?</p>
        <p class="text-danger">This action cannot be undone.</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
          <button class="btn btn-danger" @click="deleteUser">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useFirestore } from '@/composables/useFirestore';

export default {
  name: 'AdminUserManagementView',
  setup() {
    const { currentUser, isAdmin } = useAuth();
    const usersFirestore = useFirestore('users');
    const users = ref([]);
    const error = ref('');
    
    // Modal states
    const showEditModal = ref(false);
    const showDeleteModal = ref(false);
    const editingUser = ref({});
    const userToDelete = ref(null);

    const fetchUsers = async () => {
      try {
        users.value = await usersFirestore.getItems();
      } catch (err) {
        error.value = err.message || 'Failed to load users';
      }
    };

    const openEditModal = (user) => {
      editingUser.value = { ...user }; // Clone the user to avoid direct modification
      showEditModal.value = true;
    };

    const saveUser = async () => {
      try {
        error.value = '';
        
        // Validate required fields
        if (!editingUser.value.displayName || !editingUser.value.role) {
          error.value = 'Display name and role are required';
          return;
        }
        
        await usersFirestore.updateItem(editingUser.value.id, {
          displayName: editingUser.value.displayName,
          role: editingUser.value.role
        });
        
        // Update user in the local list
        const index = users.value.findIndex(u => u.id === editingUser.value.id);
        if (index !== -1) {
          users.value[index] = { ...users.value[index], ...editingUser.value };
        }
        
        showEditModal.value = false;
      } catch (err) {
        error.value = err.message || 'Failed to update user';
      }
    };

    const confirmDeleteUser = (user) => {
      userToDelete.value = user;
      showDeleteModal.value = true;
    };

    const deleteUser = async () => {
      if (!userToDelete.value) return;
      
      try {
        // Prevent deleting your own account
        if (userToDelete.value.id === currentUser.value.uid) {
          error.value = "You can't delete your own account";
          return;
        }
        
        await usersFirestore.deleteItem(userToDelete.value.id);
        users.value = users.value.filter(u => u.id !== userToDelete.value.id);
        showDeleteModal.value = false;
      } catch (err) {
        error.value = err.message || 'Failed to delete user';
      }
    };

    onMounted(fetchUsers);

    return {
      currentUser,
      isAdmin,
      users,
      error,
      showEditModal,
      showDeleteModal,
      editingUser,
      userToDelete,
      openEditModal,
      saveUser,
      confirmDeleteUser,
      deleteUser
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  font-size: 2rem;
  margin-bottom: 20px;
}

.access-denied {
  text-align: center;
  margin-top: 50px;
}

.alert {
  padding: 20px;
  border: 1px solid #f5c6cb;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 5px;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.875rem;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.user-table th,
.user-table td {
  border: 1px solid #dee2e6;
  padding: 10px;
  text-align: center;
}

.user-table th {
  background-color: #f8f9fa;
}

.user-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 100%;
  max-width: 500px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.text-danger {
  color: #dc3545;
}
</style>