<template>
  <div class="admin-import-quiz container">
    <h1 class="title">Import Quiz</h1>

    <div v-if="!currentUser || !isAdmin" class="access-denied">
      <div class="alert alert-danger">
        <h4>Access Denied</h4>
        <p>You do not have permission to access this page.</p>
      </div>
      <button class="btn btn-primary" @click="$router.push('/')">Return to Home</button>
    </div>

    <div v-else>
      <div class="form-container">
        <AdminQuizImport @cancel="goBack" @imported="handleImported" />
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import AdminQuizImport from '@/components/Admin/AdminQuizImport.vue';

export default {
  name: 'AdminImportQuizView',
  components: {
    AdminQuizImport,
  },
  setup() {
    const router = useRouter();
    const { currentUser, isAdmin } = useAuth();

    const goBack = () => {
      router.push('/admin/quizzes');
    };

    const handleImported = () => {
      // Success notification could be added here
    };

    return {
      currentUser,
      isAdmin,
      goBack,
      handleImported,
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

.form-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>