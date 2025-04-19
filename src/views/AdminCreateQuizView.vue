<template>
  <div class="admin-create-quiz container">
    <h1 class="title">Create New Quiz</h1>

    <div v-if="!currentUser || !isAdmin" class="access-denied">
      <div class="alert alert-danger">
        <h4>Access Denied</h4>
        <p>You do not have permission to access this page.</p>
      </div>
      <button class="btn btn-primary" @click="$router.push('/')">Return to Home</button>
    </div>

    <div v-else>
      <AdminQuizForm />
    </div>
  </div>
</template>

<script>
import { useAuth } from '@/composables/useAuth';
import AdminQuizForm from '@/components/Admin/AdminQuizForm.vue';

export default {
  name: 'AdminCreateQuizView',
  components: {
    AdminQuizForm,
  },
  setup() {
    const { currentUser, isAdmin } = useAuth();

    return {
      currentUser,
      isAdmin,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
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
</style>