<template>
  <div class="admin-quiz-management container">
    <!-- Title at the top -->
    <h1 class="title">Quiz Management</h1>

    <!-- Access control check -->
    <div v-if="!currentUser || !isAdmin" class="access-denied">
      <div class="alert alert-danger">
        <h4>Access Denied</h4>
        <p>You do not have permission to access this page.</p>
      </div>
      <button class="btn btn-primary" @click="$router.push('/')">Return to Home</button>
    </div>

    <div v-else>
      <div class="quiz-list">
        <!-- Header with title in vertical layout -->
        <div class="vertical-header">
          <h2>All Quizzes</h2>
          
          <!-- Action buttons stacked vertically -->
          <div class="action-buttons-vertical">
            <router-link to="/admin/quizzes/import" class="btn btn-success">
              <i class="fas fa-download"></i> Import Quiz
            </router-link>
            <router-link to="/admin/quizzes/create" class="btn btn-primary">
              <i class="fas fa-plus"></i> Create New Quiz
            </router-link>
          </div>
          
          <!-- Search Box below action buttons -->
          <div class="search-container">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search quizzes..."
              class="search-input"
            >
            <button class="btn btn-secondary" @click="searchQuery = ''">Clear</button>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading quizzes...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
        
        <!-- Content State -->
        <div v-else>
          <!-- Quiz Table -->
          <table class="quiz-table">
            <thead>
              <tr>
                <th @click="sortBy('title')">Title</th>
                <th @click="sortBy('category')">Category</th>
                <th @click="sortBy('questionsCount')">Questions</th>
                <th @click="sortBy('createdAt')">Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="quiz in sortedQuizzes" :key="quiz.id">
                <td>
                  <!-- Update link to point to quiz-detail -->
                  <router-link :to="{ name: 'quiz-detail', params: { id: quiz.id } }">{{ quiz.title }}</router-link>
                </td>
                <td>{{ quiz.category || "Uncategorized" }}</td>
                <td>{{ quiz.questions ? quiz.questions.length : 0 }}</td>
                <td>{{ formatDate(quiz.createdAt) }}</td>
                <td>
                  <div class="table-actions">
                    <router-link :to="`/admin/quizzes/edit/${quiz.id}`" class="btn btn-sm btn-primary">
                      Edit
                    </router-link>
                    <router-link :to="`/admin/questions/${quiz.id}`" class="btn btn-sm btn-info">
                      Questions
                    </router-link>
                    <button @click="confirmDeleteQuiz(quiz)" class="btn btn-sm btn-danger">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="sortedQuizzes.length === 0">
                <td colspan="5" class="empty-message">No quizzes found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteConfirm" class="modal-backdrop">
        <div class="modal-content">
          <h3>Confirm Deletion</h3>
          <p>Are you sure you want to delete the quiz <strong>{{ quizToDelete?.title }}</strong>?</p>
          <p class="text-danger">This action cannot be undone and will delete all associated questions.</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showDeleteConfirm = false">Cancel</button>
            <button class="btn btn-danger" @click="deleteQuiz">Delete</button>
          </div>
        </div>
      </div>
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
    const sortKey = ref('title');
    const sortDirection = ref('asc');
    
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
    
    // Sort quizzes based on current sort key and direction
    const sortedQuizzes = computed(() => {
      return [...filteredQuizzes.value].sort((a, b) => {
        let aValue = a[sortKey.value];
        let bValue = b[sortKey.value];
        
        // Handle nested properties like questions.length
        if (sortKey.value === 'questionsCount') {
          aValue = a.questions ? a.questions.length : 0;
          bValue = b.questions ? b.questions.length : 0;
        }
        
        // Handle null/undefined values
        if (aValue === undefined || aValue === null) aValue = '';
        if (bValue === undefined || bValue === null) bValue = '';
        
        // Handle dates
        if (sortKey.value === 'createdAt') {
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        }
        
        // Sort strings case-insensitively
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        // Apply sort direction
        if (sortDirection.value === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });
    });
    
    // Methods
    const sortBy = (key) => {
      if (sortKey.value === key) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey.value = key;
        sortDirection.value = 'asc';
      }
    };
    
    const confirmDeleteQuiz = (quiz) => {
      quizToDelete.value = quiz;
      showDeleteConfirm.value = true;
    };
    
    const deleteQuiz = async () => {
      if (quizToDelete.value) {
        await removeQuiz(quizToDelete.value.id);
        showDeleteConfirm.value = false;
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
      sortedQuizzes,
      showDeleteConfirm,
      quizToDelete,
      sortBy,
      confirmDeleteQuiz,
      deleteQuiz,
      formatDate
    };
  }
};
</script>

<style scoped>
/* Adding vertical layout styles */
.vertical-header {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.action-buttons-vertical {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-buttons-vertical .btn {
  width: 100%;
  max-width: 300px;
}

/* Keep existing styles */
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
  margin-right: 10px;
  text-decoration: none;
  display: inline-block;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.875rem;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.quiz-list {
  margin-top: 20px;
}

.search-container {
  display: flex;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  margin-right: 10px;
}

.quiz-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.quiz-table th {
  padding: 12px;
  text-align: left;
  background-color: #f8f9fa;
  cursor: pointer;
  border-bottom: 2px solid #dee2e6;
}

.quiz-table td {
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
}

.quiz-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

.table-actions {
  display: flex;
  gap: 5px;
}

.loading-state {
  text-align: center;
  padding: 40px 0;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #007bff;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-message {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}

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
  z-index: 1050;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  max-width: 500px;
  width: 100%;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.text-danger {
  color: #dc3545;
}
</style>