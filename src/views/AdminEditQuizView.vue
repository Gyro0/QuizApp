<template>
  <div class="admin-edit-quiz">
    <b-container>
      <h1 class="mb-4">Edit Quiz</h1>
      
      <div v-if="!currentUser || !isAdmin" class="text-center my-5">
        <b-alert show variant="danger">
          <h4>Access Denied</h4>
          <p>You do not have permission to access this page.</p>
        </b-alert>
        <b-button variant="primary" to="/">Return to Home</b-button>
      </div>
      
      <div v-else-if="!quizId" class="text-center my-5">
        <b-alert show variant="warning">
          <h4>Missing Quiz ID</h4>
          <p>No quiz ID was provided.</p>
        </b-alert>
        <b-button variant="primary" to="/admin/quizzes">Return to Quizzes</b-button>
      </div>
      
      <div v-else>
        <AdminQuizForm :quiz-id="quizId" />
      </div>
    </b-container>
  </div>
</template>

<script>
import { useAuth } from '@/composables/useAuth';
import { useRoute } from 'vue-router';
import AdminQuizForm from '@/components/Admin/AdminQuizForm.vue';

export default {
  name: 'AdminEditQuizView',
  components: {
    AdminQuizForm
  },
  setup() {
    const { currentUser, isAdmin } = useAuth();
    const route = useRoute();
    const quizId = route.params.id;
    
    return {
      currentUser,
      isAdmin,
      quizId
    };
  }
};
</script>