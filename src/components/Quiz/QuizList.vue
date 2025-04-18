<template>
  <div class="quiz-list">
    <!-- Loading state -->
    <div v-if="isLoading" class="text-center my-5">
      <b-spinner variant="primary" label="Loading quizzes..."></b-spinner>
      <p class="mt-2">Loading quizzes...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    
    <!-- Empty state -->
    <div v-else-if="quizzes.length === 0" class="text-center my-5">
      <p>No quizzes available at the moment.</p>
      <b-button v-if="isAdmin" variant="primary" @click="createNewQuiz">
        Create New Quiz
      </b-button>
    </div>
    
    <!-- Quiz list -->
    <div v-else>
      <div class="mb-4 d-flex justify-content-between align-items-center">
        <h2>Available Quizzes</h2>
        <b-form-input
          v-model="searchQuery"
          placeholder="Search quizzes..."
          class="w-25"
        ></b-form-input>
      </div>

      <b-row>
        <b-col
          v-for="quiz in filteredQuizzes"
          :key="quiz.id"
          cols="12" md="6" lg="4"
          class="mb-4"
        >
          <QuizCard :quiz="quiz" />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuiz } from '@/composables/useQuiz';
import { useAuth } from '@/composables/useAuth';
import QuizCard from './QuizCard.vue';

export default {
  name: 'QuizList',
  components: { QuizCard },
  props: {
    category: { type: String, default: '' }
  },
  setup(props) {
    // Composables
    const { fetchQuizzes, quizzes, error, isLoading } = useQuiz();
    const { isAdmin } = useAuth();
    const router = useRouter();
    
    // State
    const searchQuery = ref('');

    // Computed
    const filteredQuizzes = computed(() => {
      if (!searchQuery.value) return quizzes.value;
      
      const query = searchQuery.value.toLowerCase();
      return quizzes.value.filter(quiz => 
        quiz.title.toLowerCase().includes(query) || 
        quiz.description.toLowerCase().includes(query)
      );
    });

    // Methods
    const createNewQuiz = () => router.push('/admin/quizzes/create');
    
    // Lifecycle
    onMounted(async () => {
      const constraints = props.category 
        ? [{ field: 'category', op: '==', value: props.category }] 
        : [];
      
      await fetchQuizzes(constraints);
    });

    return {
      quizzes,
      error,
      isLoading,
      isAdmin,
      searchQuery,
      filteredQuizzes,
      createNewQuiz
    };
  }
};
</script>