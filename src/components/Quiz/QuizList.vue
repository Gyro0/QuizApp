<template>
  <div class="quiz-list">
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement des quiz...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="quizzes.length === 0" class="empty-state">
      <p>Aucun quiz disponible pour le moment.</p>
      <button 
        v-if="isAdmin" 
        class="btn btn-primary"
        @click="createNewQuiz"
      >
        Créer un nouveau quiz
      </button>
    </div>
    
    <!-- Quiz list -->
    <div v-else class="quiz-list-content">
      <div class="quiz-list-header">
        <h2>Quiz disponibles</h2>
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un quiz..."
            class="search-input"
          >
        </div>
      </div>

      <div class="quiz-grid">
        <QuizCard
          v-for="quiz in filteredQuizzes"
          :key="quiz.id"
          :quiz="quiz"
        />
      </div>
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

<style scoped>
.quiz-list {
  padding: 2rem;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--secondary-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  color: var(--error-color);
  background-color: var(--error-bg);
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.quiz-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.quiz-list-header h2 {
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.search-container {
  position: relative;
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--secondary-color);
  border-radius: 0.5rem;
  background-color: var(--white);
  color: var(--text-primary);
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Shopping-like card grid: cards take full line on small, wrap on large */
.quiz-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.quiz-grid > * {
  flex: 1 1 350px;
  min-width: 320px;
  max-width: 100%;
  margin-bottom: 0;
}

@media (max-width: 900px) {
  .quiz-grid {
    gap: 1.2rem;
  }
  .quiz-grid > * {
    flex-basis: 100%;
    min-width: 0;
  }
}

@media (max-width: 768px) {
  .quiz-list {
    padding: 1rem;
  }

  .quiz-list-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .search-container {
    width: 100%;
  }

  .quiz-grid {
    flex-direction: column;
    gap: 1rem;
  }
  .quiz-grid > * {
    flex-basis: 100%;
    min-width: 0;
  }
}
</style>