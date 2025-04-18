<template>
  <div class="admin-import-quiz">
    <b-container>
      <h1 class="mb-4">Import Quiz</h1>
      
      <div v-if="!currentUser || !isAdmin" class="text-center my-5">
        <b-alert show variant="danger">
          <h4>Access Denied</h4>
          <p>You do not have permission to access this page.</p>
        </b-alert>
        <b-button variant="primary" to="/">Return to Home</b-button>
      </div>
      
      <div v-else>
        <b-row>
          <b-col md="8" class="mx-auto">
            <AdminQuizImport @cancel="goBack" @imported="handleImported" />
          </b-col>
        </b-row>
      </div>
    </b-container>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import AdminQuizImport from '@/components/Admin/AdminQuizImport.vue';

export default {
  name: 'AdminImportQuizView',
  components: {
    AdminQuizImport
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
      handleImported
    };
  }
};
</script>