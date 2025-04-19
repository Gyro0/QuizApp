<template>
  <div class="admin-quiz-management container">
    <h1 class="title">Quiz Management</h1>

    <div v-if="!currentUser || !isAdmin" class="access-denied">
      <div class="alert alert-danger">
        <h4>Access Denied</h4>
        <p>You do not have permission to access this page.</p>
      </div>
      <button class="btn btn-primary" @click="$router.push('/')">Return to Home</button>
    </div>

    <div v-else>
      <div class="quiz-list">
        <!-- Header with Action Buttons -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>All Quizzes</h2>
          <div>
            <b-button variant="success" to="/admin/quizzes/import" class="mr-2">
              <i class="fas fa-download mr-1"></i> Import Quiz
            </b-button>
            <b-button variant="primary" to="/admin/quizzes/create">
              <i class="fas fa-plus mr-1"></i> Create New Quiz
            </b-button>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center my-5">
          <b-spinner variant="primary" label="Loading quizzes..."></b-spinner>
          <p class="mt-2">Loading quizzes...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
        
        <!-- Content State -->
        <div v-else>
          <!-- Search Box -->
          <b-input-group class="mb-3">
            <b-form-input
              v-model="searchQuery"
              placeholder="Search quizzes..."
              trim
            ></b-form-input>
            <b-input-group-append>
              <b-button variant="outline-secondary" @click="searchQuery = ''">Clear</b-button>
            </b-input-group-append>
          </b-input-group>
          
          <!-- Quiz Table -->
          <b-table
            :items="filteredQuizzes"
            :fields="fields"
            striped
            hover
            responsive
            show-empty
            empty-text="No quizzes found"
          >
            <template #cell(title)="data">
              <router-link :to="`/quiz/${data.item.id}`">{{ data.item.title }}</router-link>
            </template>
            
            <template #cell(createdAt)="data">
              {{ formatDate(data.item.createdAt) }}
            </template>
            
            <template #cell(actions)="data">
              <b-button-group size="sm">
                <b-button variant="outline-primary" :to="`/admin/quizzes/edit/${data.item.id}`">
                  Edit
                </b-button>
                <b-button variant="outline-info" :to="`/admin/questions/${data.item.id}`">
                  Questions
                </b-button>
                <b-button variant="outline-danger" @click="confirmDeleteQuiz(data.item)">
                  Delete
                </b-button>
              </b-button-group>
            </template>
          </b-table>
        </div>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <b-modal
        v-model="showDeleteConfirm"
        title="Confirm Deletion"
        ok-variant="danger"
        ok-title="Delete"
        @ok="deleteQuiz"
      >
        <p>Are you sure you want to delete the quiz <strong>{{ quizToDelete?.title }}</strong>?</p>
        <p class="text-danger">This action cannot be undone and will delete all associated questions.</p>
      </b-modal>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useQuiz } from '@/composables/useQuiz';

export default {
  name: 'AdminQuizManagementView',
  setup() {
    // Composables
    const { currentUser, isAdmin } = useAuth();
    const { fetchQuizzes, quizzes, error, isLoading, deleteQuiz: removeQuiz } = useQuiz();
    
    // State
    const searchQuery = ref('');
    const showDeleteConfirm = ref(false);
    const quizToDelete = ref(null);
    
    // Table configuration
    const fields = [
      { key: 'title', label: 'Title', sortable: true },
      { key: 'category', label: 'Category', sortable: true },
      { key: 'questions.length', label: 'Questions', sortable: true },
      { key: 'createdAt', label: 'Created', sortable: true },
      { key: 'actions', label: 'Actions' }
    ];
    
    // Computed properties
    const filteredQuizzes = computed(() => {
      if (!searchQuery.value) return quizzes.value;
      
      const query = searchQuery.value.toLowerCase();
      return quizzes.value.filter(quiz => 
        quiz.title.toLowerCase().includes(query) || 
        (quiz.category && quiz.category.toLowerCase().includes(query)) ||
        (quiz.description && quiz.description.toLowerCase().includes(query))
      );
    });
    
    // Methods
    const confirmDeleteQuiz = (quiz) => {
      quizToDelete.value = quiz;
      showDeleteConfirm.value = true;
    };
    
    const deleteQuiz = async () => {
      if (quizToDelete.value) {
        await removeQuiz(quizToDelete.value.id);
        await fetchQuizzes();
      }
    };
    
    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    };
    
    // Lifecycle hooks
    onMounted(fetchQuizzes);
    
    return {
      currentUser,
      isAdmin,
      quizzes,
      error,
      isLoading,
      searchQuery,
      filteredQuizzes,
      fields,
      showDeleteConfirm,
      quizToDelete,
      confirmDeleteQuiz,
      deleteQuiz,
      formatDate
    };
  }
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

.quiz-list {
  margin-top: 20px;
}
</style>