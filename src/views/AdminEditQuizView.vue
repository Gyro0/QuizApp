<template>
  <div class="admin-edit-quiz container">
    <h1 class="title">Edit Quiz</h1>

    <div v-if="!currentUser || !isAdmin" class="access-denied">
      <div class="alert alert-danger">
        <h4>Access Denied</h4>
        <p>You do not have permission to access this page.</p>
      </div>
      <button class="btn btn-primary" @click="$router.push('/')">Return to Home</button>
    </div>

    <div v-else-if="!quizId" class="access-denied">
      <div class="alert alert-warning">
        <h4>Missing Quiz ID</h4>
        <p>No quiz ID was provided.</p>
      </div>
      <button class="btn btn-primary" @click="$router.push('/admin/quizzes')">Return to Quizzes</button>
    </div>

    <div v-else>
      <AdminQuizForm :quiz-id="quizId" />
    </div>
  </div>
</template>

<script>
import { useAuth } from '@/composables/useAuth';
import { useRoute } from 'vue-router';
import AdminQuizForm from '@/components/Admin/AdminQuizForm.vue';

export default {
  name: 'AdminEditQuizView',
  components: {
    AdminQuizForm,
  },
  setup() {
    const { currentUser, isAdmin } = useAuth();
    const route = useRoute();
    const quizId = route.params.id;

    return {
      currentUser,
      isAdmin,
      quizId,
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

.alert-warning {
  border-color: #ffeeba;
  background-color: #fff3cd;
  color: #856404;
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