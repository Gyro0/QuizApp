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
                <button class="btn btn-primary btn-sm" @click="editUser(user)">Edit</button>
                <button class="btn btn-danger btn-sm" @click="deleteUser(user)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
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

    const fetchUsers = async () => {
      users.value = await usersFirestore.getItems();
    };

    const editUser = (user) => {
      console.log('Edit user:', user);
    };

    const deleteUser = (user) => {
      console.log('Delete user:', user);
    };

    onMounted(fetchUsers);

    return {
      currentUser,
      isAdmin,
      users,
      editUser,
      deleteUser,
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

.btn-danger {
  background-color: #dc3545;
  color: white;
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
</style>