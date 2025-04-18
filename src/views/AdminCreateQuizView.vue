<template>
  <div class="admin-create-quiz">
    <b-container>
      <h1 class="mb-4">Create New Quiz</h1>
      
      <div v-if="!currentUser || !isAdmin" class="text-center my-5">
        <b-alert show variant="danger">
          <h4>Access Denied</h4>
          <p>You do not have permission to access this page.</p>
        </b-alert>
        <b-button variant="primary" to="/">Return to Home</b-button>
      </div>
      
      <div v-else>
        <AdminQuizForm />
      </div>
    </b-container>
  </div>
</template>

<script>
import { useAuth } from '@/composables/useAuth';
import AdminQuizForm from '@/components/Admin/AdminQuizForm.vue';

export default {
  name: 'AdminCreateQuizView',
  components: {
    AdminQuizForm
  },
  setup() {
    const { currentUser, isAdmin } = useAuth();
    
    return {
      currentUser,
      isAdmin
    };
  }
};
</script>