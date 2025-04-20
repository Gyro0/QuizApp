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
    <div v-else-if="enhancedQuizzes.length === 0" class="empty-state">
      <p>Aucun quiz disponible pour cette catégorie.</p>
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

      <div class="quiz-vertical-list">
        <QuizCard
          v-for="quiz in enhancedQuizzes"
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
import { useFirestore } from '@/composables/useFirestore';
import QuizCard from './QuizCard.vue';

export default {
  name: 'QuizList',
  components: { QuizCard },
  props: {
    category: { type: String, default: '' },
    getCategoryName: {
      type: Function,
      default: (id) => id ? id.toString() : ''
    }
  },
  setup(props) {
    // Composables
    const { fetchQuizzes, quizzes, error, isLoading } = useQuiz();
    const { isAdmin } = useAuth();
    const router = useRouter();
    const questionsFirestore = useFirestore('questions');
    
    // State
    const searchQuery = ref('');
    const questionCounts = ref({});
    const isLoadingCounts = ref(false);

    // Category mapping
    const categoryMapping = {
      9: 'Culture Générale',
      10: 'Livres',
      11: 'Films',
      12: 'Musique',
      13: 'Comédies musicales',
      14: 'Télévision',
      15: 'Jeux Vidéo',
      16: 'Jeux de société',
      17: 'Sciences',
      18: 'Informatique',
      19: 'Mathématiques',
      20: 'Mythologie',
      21: 'Sport',
      22: 'Géographie',
      23: 'Histoire',
      24: 'Politique',
      25: 'Art',
      26: 'Célébrités',
      27: 'Animaux',
      28: 'Véhicules',
      29: 'Bandes dessinées',
      30: 'Gadgets',
      31: 'Manga & Anime',
      32: 'Dessins animés'
    };

    // Local getCategoryName function
    const getCategoryName = (categoryId) => {
      if (!categoryId) return '';
      
      // If it's already a name (string that's not a number), return it
      if (isNaN(categoryId)) return categoryId;
      
      // Return the mapped name or a default if not found
      return categoryMapping[categoryId] || `Catégorie ${categoryId}`;
    };

    // Computed
    const filteredQuizzes = computed(() => {
      // First filter by category if specified
      let filtered = quizzes.value;
      
      if (props.category) {
        filtered = quizzes.value.filter(quiz => {
          if (!quiz.category) return false;
          return quiz.category.toString() === props.category.toString();
        });
      }
      
      // Then filter by search query if provided
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(quiz => 
          quiz.title.toLowerCase().includes(query) || 
          quiz.description?.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    });

    // Enhanced quizzes with additional data
    const enhancedQuizzes = computed(() => {
      return filteredQuizzes.value.map(quiz => ({
        ...quiz,
        questionsCount: questionCounts.value[quiz.id] || 0,
        timeLimit: quiz.timeLimit || 10,
        categoryName: getCategoryName(quiz.category) // Use the local function instead of props
      }));
    });

    // Methods
    const createNewQuiz = () => router.push('/admin/quizzes/create');
    
    // Fetch question counts for each quiz
    const fetchQuestionCounts = async () => {
      isLoadingCounts.value = true;
      
      try {
        const counts = {};
        
        // Fetch questions for each quiz in parallel
        await Promise.all(quizzes.value.map(async (quiz) => {
          const constraints = [{ field: 'quizId', op: '==', value: quiz.id }];
          const questions = await questionsFirestore.getItems(constraints);
          counts[quiz.id] = questions.length;
        }));
        
        questionCounts.value = counts;
      } catch (err) {
        console.error('Error fetching question counts:', err);
      } finally {
        isLoadingCounts.value = false;
      }
    };
    
    // Lifecycle
    onMounted(async () => {
      await fetchQuizzes();
      await fetchQuestionCounts();
    });

    return {
      quizzes,
      error,
      isLoading,
      isAdmin,
      searchQuery,
      filteredQuizzes,
      enhancedQuizzes,
      createNewQuiz,
      getCategoryName
    };
  }
};
</script>

<style scoped>
.quiz-list {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  margin: 2rem 0;
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
.quiz-list-content {
  width: 100%;
  display: flex;
  flex-direction: column;
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

/* Vertical list style for quiz cards */
.quiz-vertical-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

/* Make sure cards take full width */
.quiz-vertical-list > * {
  width: 100%;
}

/* Make quiz cards appear horizontal but stacked vertically */
:deep(.quiz-card) {
  width: 100%;
}

:deep(.quiz-card-content) {
  display: flex;
  flex-direction: row;
  align-items: center;
}

:deep(.quiz-card-main) {
  flex: 1;
  padding-right: 1.5rem;
}

:deep(.quiz-card-stats) {
  min-width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  border-left: 1px solid var(--secondary-color, #e0e0e0);
  padding-left: 1.5rem;
}

@media (max-width: 768px) {
  .quiz-list {
    padding: 0.5rem;
  }

  .quiz-list-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .search-container {
    width: 100%;
  }
  
  :deep(.quiz-card-content) {
    flex-direction: column;
  }
  
  :deep(.quiz-card-main) {
    padding-right: 0;
    padding-bottom: 1rem;
    width: 100%;
  }
  
  :deep(.quiz-card-stats) {
    border-left: none;
    border-top: 1px solid var(--secondary-color, #e0e0e0);
    padding-left: 0;
    padding-top: 1rem;
    width: 100%;
    align-items: center;
  }
}
</style>