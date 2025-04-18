<template>
  <div class="admin-question-management">
    <b-container>
      <h1 class="mb-4">Question Management</h1>
      
      <!-- Access Control -->
      <div v-if="!currentUser || !isAdmin" class="text-center my-5">
        <b-alert show variant="danger">
          <h4>Access Denied</h4>
          <p>You do not have permission to access this page.</p>
        </b-alert>
        <b-button variant="primary" to="/">Return to Home</b-button>
      </div>
      
      <!-- Loading State -->
      <div v-else-if="isLoading" class="text-center my-5">
        <b-spinner variant="primary" label="Loading questions..."></b-spinner>
        <p class="mt-2">Loading questions...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
      
      <!-- Content State -->
      <div v-else>
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>{{ quiz?.title || 'Questions' }}</h2>
            <p v-if="quiz?.description" class="text-muted">{{ quiz.description }}</p>
          </div>
          <div>
            <b-button variant="outline-secondary" class="mr-2" @click="goBack">
              Back to Quizzes
            </b-button>
            <b-button variant="primary" @click="showAddQuestion = true">
              <i class="fas fa-plus mr-1"></i> Add Question
            </b-button>
          </div>
        </div>
        
        <!-- Import Questions Button -->
        <div v-if="quiz" class="mb-4">
          <b-button variant="success" @click="showImportModal = true">
            <i class="fas fa-cloud-download-alt mr-1"></i> Import More Questions
          </b-button>
        </div>
        
        <!-- Empty State -->
        <div v-if="questions.length === 0" class="text-center my-5">
          <p>No questions yet for this quiz.</p>
          <b-button variant="primary" @click="showAddQuestion = true">
            Add Your First Question
          </b-button>
        </div>
        
        <!-- Questions List -->
        <b-card v-else class="mb-4">
          <div 
            v-for="(question, index) in questions" 
            :key="question.id"
            class="question-item p-3 mb-3 border rounded"
          >
            <div class="d-flex justify-content-between align-items-start">
              <div class="d-flex">
                <div class="mr-2 text-muted">{{ index + 1 }}.</div>
                <div>
                  <h5>{{ question.text }}</h5>
                  <b-img v-if="question.imageUrl" :src="question.imageUrl" thumbnail height="80px"></b-img>
                  
                  <div class="options mt-2">
                    <div 
                      v-for="option in question.options" 
                      :key="option"
                      class="option-item"
                      :class="{ 'correct-answer': option === question.correctAnswer }"
                    >
                      {{ option }}
                      <b-badge v-if="option === question.correctAnswer" variant="success">Correct</b-badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <b-button-group size="sm">
                  <b-button variant="outline-primary" @click="editQuestion(question)">Edit</b-button>
                  <b-button variant="outline-danger" @click="confirmDeleteQuestion(question)">Delete</b-button>
                </b-button-group>
              </div>
            </div>
          </div>
        </b-card>
      </div>
    </b-container>
    
    <!-- Question Form Modal -->
    <b-modal
      v-model="showAddQuestion"
      :title="editingQuestion ? 'Edit Question' : 'Add New Question'"
      size="lg"
      @hidden="resetForm"
      @ok="saveQuestion"
    >
      <b-form>
        <b-form-group label="Question Text" label-for="question-text">
          <b-form-textarea
            id="question-text"
            v-model="questionForm.text"
            placeholder="Enter the question"
            required
            rows="3"
          ></b-form-textarea>
        </b-form-group>
        
        <b-form-group label="Image URL (Optional)" label-for="question-image">
          <b-form-input
            id="question-image"
            v-model="questionForm.imageUrl"
            placeholder="Enter image URL"
          ></b-form-input>
          <small class="form-text text-muted">Add an image to illustrate the question.</small>
        </b-form-group>
        
        <b-form-group label="Options">
          <div v-for="(option, index) in questionForm.options" :key="index" class="d-flex mb-2">
            <b-form-input
              v-model="questionForm.options[index]"
              :placeholder="`Option ${index + 1}`"
              required
            ></b-form-input>
            
            <b-form-radio
              v-model="questionForm.correctAnswer"
              :value="option"
              class="ml-2 d-flex align-items-center"
            >Correct</b-form-radio>
            
            <b-button 
              v-if="questionForm.options.length > 2"
              variant="outline-danger" 
              size="sm"
              class="ml-2"
              @click="removeOption(index)"
            ><i class="fas fa-times"></i></b-button>
          </div>
          
          <b-button variant="outline-secondary" size="sm" class="mt-2" @click="addOption">
            <i class="fas fa-plus mr-1"></i> Add Option
          </b-button>
        </b-form-group>
      </b-form>
    </b-modal>
    
    <!-- Import Questions Modal -->
    <b-modal 
      v-model="showImportModal" 
      title="Import Questions" 
      size="lg"
      @ok="handleImportQuestions"
    >
      <b-form>
        <b-form-group label="Category">
          <b-form-select v-model="importForm.category" :options="categoryOptions"></b-form-select>
        </b-form-group>
        
        <b-form-group label="Difficulty">
          <b-form-select v-model="importForm.difficulty" :options="difficultyOptions"></b-form-select>
        </b-form-group>
        
        <b-form-group label="Number of Questions">
          <b-form-input
            v-model.number="importForm.amount"
            type="number"
            min="1"
            max="50"
            required
          ></b-form-input>
        </b-form-group>
      </b-form>
      
      <template #modal-footer="{ ok, cancel }">
        <b-button variant="secondary" @click="cancel()">Cancel</b-button>
        <b-button variant="primary" @click="ok()" :disabled="isImporting">
          <b-spinner v-if="isImporting" small class="mr-1"></b-spinner>
          Import Questions
        </b-button>
      </template>
    </b-modal>
    
    <!-- Delete Confirmation Modal -->
    <b-modal
      v-model="showDeleteConfirm"
      title="Confirm Deletion"
      ok-variant="danger"
      ok-title="Delete"
      @ok="deleteQuestion"
    >
      <p>Are you sure you want to delete this question?</p>
      <p class="text-danger">This action cannot be undone.</p>
    </b-modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useQuiz } from '@/composables/useQuiz';
import { useFirestore } from '@/composables/useFirestore';
import { useExternalQuiz } from '@/composables/useExternalQuiz';

export default {
  name: 'AdminQuestionManagementView',
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
        resetForm();
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
      handleImportQuestions
    };
  }
};
</script>

<style scoped>
.question-item {
  background-color: #f8f9fa;
  transition: background-color 0.2s;
}

.question-item:hover {
  background-color: #e9ecef;
}

.option-item {
  padding: 5px 10px;
  margin-bottom: 5px;
  background-color: #ffffff;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.option-item.correct-answer {
  background-color: #d4edda;
  border-color: #c3e6cb;
}
</style>