<template>
  <div class="admin-question-management container">
    <h1 class="title">Question Management</h1>

    <div v-if="!currentUser || !isAdmin" class="access-denied">
      <div class="alert alert-danger">
        <h4>Access Denied</h4>
        <p>You do not have permission to access this page.</p>
      </div>
      <button class="btn btn-primary" @click="$router.push('/')">Return to Home</button>
    </div>

    <div v-else>
      <div class="question-list">
        <!-- Question list and management UI goes here -->
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center my-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading questions...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
        
        <!-- Content State -->
        <div v-else>
          <!-- Header with fixed buttons -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>{{ quiz?.title || 'Questions' }}</h2>
              <p v-if="quiz?.description" class="text-muted">{{ quiz.description }}</p>
            </div>
            <div>
              <button type="button" class="btn btn-outline-secondary mr-2" @click="goBack">
                <i class="fas fa-arrow-left"></i> Back to Quizzes
              </button>
              <button type="button" class="btn btn-primary" @click="showAddQuestion = true">
                <i class="fas fa-plus"></i> Add Question
              </button>
            </div>
          </div>
          
          <!-- Import Questions Button -->
          <div v-if="quiz" class="mb-4">
            <button type="button" class="btn btn-success" @click="showImportModal = true">
              <i class="fas fa-cloud-download-alt"></i> Import More Questions
            </button>
          </div>
          
          <!-- Empty State fixed -->
          <div v-if="questions.length === 0" class="text-center my-5">
            <p>No questions yet for this quiz.</p>
            <button type="button" class="btn btn-primary" @click="showAddQuestion = true">
              <i class="fas fa-plus"></i> Add Your First Question
            </button>
          </div>
          
          <!-- Questions List -->
          <div class="questions-list">
            <AdminQuestionItem
              v-for="(question, index) in questions"
              :key="question.id"
              :question="question"
              :index="index"
              @edit="editQuestion"
              @delete="confirmDeleteQuestion"
            />
          </div>
          
          <!-- Question Edit Modal -->
          <div v-if="showAddQuestion" class="modal-backdrop">
            <div class="modal-content question-form-container">
              <h3>{{ editingQuestion ? 'Edit Question' : 'Add New Question' }}</h3>
              
              <!-- Form content goes here -->
              <div class="form-group">
                <label for="question-text">Question Text</label>
                <textarea
                  id="question-text"
                  v-model="questionForm.text"
                  class="input"
                  placeholder="Enter the question"
                  required
                  rows="3"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="question-image">Image URL (optional)</label>
                <input
                  id="question-image"
                  v-model="questionForm.imageUrl"
                  class="input"
                  placeholder="Enter image URL if needed"
                />
              </div>

              <div class="form-group">
                <label>Options</label>
                <div
                  v-for="(option, index) in questionForm.options"
                  :key="index"
                  class="option-row"
                >
                  <input
                    v-model="questionForm.options[index]"
                    :placeholder="`Option ${index + 1}`"
                    class="input option-input"
                    required
                  />
                  <input
                    type="radio"
                    :name="'correct-answer'"
                    :value="option"
                    v-model="questionForm.correctAnswer"
                    class="radio"
                    required
                  />
                  <label class="radio-label">Correct</label>
                  <button
                    v-if="questionForm.options.length > 2"
                    type="button"
                    class="btn btn-danger btn-sm"
                    @click="removeOption(index)"
                    title="Remove option"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  @click="addOption"
                  v-if="questionForm.options.length < 6"
                >
                  <i class="fas fa-plus"></i> Add Option
                </button>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="cancelEdit">Cancel</button>
                <button type="button" class="btn btn-primary" @click="saveQuestion">{{ editingQuestion ? 'Update' : 'Add' }} Question</button>
              </div>
            </div>
          </div>

          <!-- Add this Import Modal -->
          <div v-if="showImportModal" class="modal-backdrop">
            <div class="modal-content">
              <h3>Import Questions</h3>
              
              <div class="form-group">
                <label for="import-category">Category</label>
                <select 
                  id="import-category" 
                  v-model="importForm.category"
                  class="input"
                >
                  <option v-for="category in categoryOptions" :key="category.value" :value="category.value">
                    {{ category.text }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="import-difficulty">Difficulty</label>
                <select 
                  id="import-difficulty" 
                  v-model="importForm.difficulty"
                  class="input"
                >
                  <option v-for="difficulty in difficultyOptions" :key="difficulty.value" :value="difficulty.value">
                    {{ difficulty.text }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="import-amount">Number of Questions</label>
                <input
                  id="import-amount"
                  type="number"
                  v-model.number="importForm.amount"
                  class="input"
                  min="1"
                  max="50"
                />
              </div>
              
              <div v-if="importError" class="alert alert-danger">
                {{ importError }}
              </div>
              
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="showImportModal = false">
                  Cancel
                </button>
                <button 
                  type="button" 
                  class="btn btn-success" 
                  @click="handleImportQuestions"
                  :disabled="isImporting"
                >
                  <span v-if="isImporting">
                    <i class="fas fa-spinner fa-spin"></i> Importing...
                  </span>
                  <span v-else>
                    <i class="fas fa-cloud-download-alt"></i> Import
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Add Delete Confirmation Modal -->
          <div v-if="showDeleteConfirm" class="modal-backdrop">
            <div class="modal-content">
              <h3>Delete Question</h3>
              <p>Are you sure you want to delete this question? This action cannot be undone.</p>
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="showDeleteConfirm = false">Cancel</button>
                <button type="button" class="btn btn-danger" @click="deleteQuestion(); showDeleteConfirm = false;">
                  <i class="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useQuiz } from '@/composables/useQuiz';
import { useFirestore } from '@/composables/useFirestore';
import { useExternalQuiz } from '@/composables/useExternalQuiz';
import AdminQuestionItem from '@/components/Admin/AdminQuestionItem.vue';

export default {
  name: 'AdminQuestionManagementView',
  components: {
    AdminQuestionItem
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const quizId = route.params.id;
    
    const { currentUser, isAdmin } = useAuth();
    const quizFirestore = useFirestore('quizzes');
    const questionsFirestore = useFirestore('questions');
    
    const quiz = ref(null);
    const questions = ref([]);
    const isLoading = ref(true);
    const error = ref(null);
    
    const showAddQuestion = ref(false);
    const showDeleteConfirm = ref(false);
    const editingQuestion = ref(null);
    const questionToDelete = ref(null);
    
    const questionForm = ref({
      text: '',
      imageUrl: '',
      options: ['', ''],
      correctAnswer: ''
    });
    
    const showImportModal = ref(false);
    const { 
      importQuestionsForExistingQuiz, 
      getCategories,
      isLoading: isImporting,
      error: importError 
    } = useExternalQuiz();
    
    const categories = ref([]);
    const importForm = ref({
      category: '',
      difficulty: '',
      amount: 10
    });
    
    const categoryOptions = computed(() => {
      const options = [{ value: '', text: 'Any Category' }];
      categories.value.forEach(category => {
        options.push({
          value: category.id,
          text: category.name
        });
      });
      return options;
    });
    
    const difficultyOptions = [
      { value: '', text: 'Any Difficulty' },
      { value: 'easy', text: 'Easy' },
      { value: 'medium', text: 'Medium' },
      { value: 'hard', text: 'Hard' }
    ];
    
    const loadCategories = async () => {
      const fetchedCategories = await getCategories();
      categories.value = fetchedCategories;
    };
    
    const handleImportQuestions = async () => {
      const success = await importQuestionsForExistingQuiz(
        quizId,
        importForm.value.amount,
        importForm.value.category,
        importForm.value.difficulty
      );
      
      if (success) {
        showImportModal.value = false;
        loadQuizAndQuestions();
      }
    };
    
    const loadQuizAndQuestions = async () => {
      isLoading.value = true;
      error.value = null;
      
      try {
        const quizData = await quizFirestore.getItem(quizId);
        if (!quizData) {
          error.value = 'Quiz not found';
          return;
        }
        quiz.value = quizData;
        
        const constraints = [
          { field: 'quizId', op: '==', value: quizId },
          { name: 'orderBy', field: 'order', direction: 'asc' }
        ];
        
        const questionData = await questionsFirestore.getItems(constraints);
        questions.value = questionData;
      } catch (err) {
        console.error('Error loading quiz and questions:', err);
        error.value = err.message;
      } finally {
        isLoading.value = false;
      }
    };
    
    const resetForm = () => {
      questionForm.value = {
        text: '',
        imageUrl: '',
        options: ['', ''],
        correctAnswer: ''
      };
      editingQuestion.value = null;
    };
    
    const addOption = () => {
      questionForm.value.options.push('');
    };
    
    const removeOption = (index) => {
      const options = [...questionForm.value.options];
      const removedOption = options[index];
      
      options.splice(index, 1);
      questionForm.value.options = options;
      
      if (questionForm.value.correctAnswer === removedOption) {
        questionForm.value.correctAnswer = '';
      }
    };
    
    const editQuestion = (question) => {
      editingQuestion.value = question;
      questionForm.value = {
        text: question.text,
        imageUrl: question.imageUrl || '',
        options: [...question.options],
        correctAnswer: question.correctAnswer
      };
      showAddQuestion.value = true;
      // No need for scrollIntoView with a modal
    };
    
    const saveQuestion = async () => {
      if (!questionForm.value.text || 
          questionForm.value.options.some(o => !o) ||
          !questionForm.value.correctAnswer) {
        return;
      }
      
      try {
        const questionData = {
          quizId,
          text: questionForm.value.text,
          options: questionForm.value.options.filter(o => o),
          correctAnswer: questionForm.value.correctAnswer,
          order: editingQuestion.value ? editingQuestion.value.order : questions.value.length
        };
        
        if (questionForm.value.imageUrl) {
          questionData.imageUrl = questionForm.value.imageUrl;
        }
        
        if (editingQuestion.value) {
          await questionsFirestore.updateItem(editingQuestion.value.id, questionData);
        } else {
          await questionsFirestore.addItem(questionData);
        }
        
        await loadQuizAndQuestions();
        router.push(`/admin/quizzes/${quizId}/questions`);
      } catch (err) {
        console.error('Error saving question:', err);
        error.value = err.message;
      }
    };
    
    const confirmDeleteQuestion = (question) => {
      questionToDelete.value = question;
      showDeleteConfirm.value = true;
    };
    
    const deleteQuestion = async () => {
      if (!questionToDelete.value) return;
      
      try {
        await questionsFirestore.deleteItem(questionToDelete.value.id);
        await loadQuizAndQuestions();
      } catch (err) {
        console.error('Error deleting question:', err);
        error.value = err.message;
      }
    };
    
    const updateOrder = async () => {
      const updates = questions.value.map((question, index) => {
        return questionsFirestore.updateItem(question.id, { order: index });
      });
      
      try {
        await Promise.all(updates);
      } catch (err) {
        console.error('Error updating question order:', err);
        error.value = err.message;
        await loadQuizAndQuestions();
      }
    };
    
    const goBack = () => {
      router.push('/admin/quizzes');
    };
    
    const cancelEdit = () => {
      showAddQuestion.value = false;
      editingQuestion.value = null;
      resetForm();
    };
    
    onMounted(() => {
      loadQuizAndQuestions();
      loadCategories();
    });
    
    return {
      currentUser,
      isAdmin,
      quiz,
      questions,
      isLoading,
      error,
      showAddQuestion,
      showDeleteConfirm,
      editingQuestion,
      questionForm,
      resetForm,
      addOption,
      removeOption,
      editQuestion,
      saveQuestion,
      confirmDeleteQuestion,
      deleteQuestion,
      updateOrder,
      goBack,
      showImportModal,
      importForm,
      categoryOptions,
      difficultyOptions,
      isImporting,
      importError,
      handleImportQuestions,
      cancelEdit
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
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn i {
  margin-right: 0.5rem;
}

.btn-primary {
  background-color: #007bff;
  border: 1px solid #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  border: 1px solid #6c757d;
  color: white;
}

.btn-outline-secondary {
  background-color: transparent;
  border: 1px solid #6c757d;
  color: #6c757d;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  color: white;
}

.btn-success {
  background-color: #28a745;
  border: 1px solid #28a745;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  border: 1px solid #dc3545;
  color: white;
}

.mr-2 {
  margin-right: 0.5rem;
}

.d-flex {
  display: flex;
}

.justify-content-between {
  justify-content: space-between;
}

.align-items-center {
  align-items: center;
}

.mb-4 {
  margin-bottom: 1rem;
}

.spinner-border {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  vertical-align: text-bottom;
  border: 0.25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.question-list {
  margin-top: 20px;
}

.questions-list {
  margin-bottom: 2rem;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  width: 90%;
  max-width: 600px;
}

.question-form-container {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.option-input {
  flex: 1;
}

.radio {
  margin-left: 0.5rem;
}

.radio-label {
  margin-left: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>