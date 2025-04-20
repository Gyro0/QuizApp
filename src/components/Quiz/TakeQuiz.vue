<template>
  <div class="take-quiz">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement du quiz...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    
    <!-- Not Found State -->
    <div v-else-if="!currentQuiz" class="empty-state">
      <p>Quiz introuvable.</p>
      <router-link class="btn btn-primary" to="/">Retour à l'accueil</router-link>
    </div>
    
    <!-- Quiz Content -->
    <div v-else>
      <!-- Quiz In Progress -->
      <div v-if="!quizCompleted">
        <div class="quiz-header">
          <h2 class="quiz-title">{{ currentQuiz.title }}</h2>
          <p class="quiz-description">{{ currentQuiz.description }}</p>
          
          <!-- Fix QuizTimer by ensuring timeLimit is a valid number -->
          <div class="quiz-meta">
            <span class="meta-item">{{ currentQuestions.length }} questions</span>
            <QuizTimer
              ref="timerRef"
              :duration="getValidDuration()"
            />
          </div>
        </div>
        <QuizQuestion
          :question="currentQuestion"
          :questionIndex="currentQuestionIndex"
          :userAnswer="userAnswers[currentQuestionIndex]"
          @answer-selected="handleAnswerSelected"
        />
        <QuizNavigation
          :currentIndex="currentQuestionIndex"
          :totalQuestions="currentQuestions.length"
          :userAnswers="userAnswers"
          :canFinish="isQuizCompleted"
          @previous="goToPreviousQuestion"
          @next="goToNextQuestion"
          @finish="completeQuiz"
        />
      </div>
      
      <!-- Quiz Completed -->
      <div v-else>
        <QuizResults
          :quiz-id="quizId"
          :quiz-title="currentQuiz.title"
          :score="currentScore"
          :total-questions="totalPossibleScore"
          :questions="currentQuestions"
          :user-answers="userAnswers"
          :time-spent="timerRef?.getElapsedTime() || ''"
          :user="safeUser"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useQuiz } from '@/composables/useQuiz';
import { useAuth } from '@/composables/useAuth';
import QuizQuestion from './QuizQuestion.vue';
import QuizNavigation from './QuizNavigation.vue';
import QuizResults from './QuizResults.vue';
import QuizTimer from './QuizTimer.vue';

export default {
  name: 'TakeQuiz',
  components: { QuizQuestion, QuizNavigation, QuizResults, QuizTimer },
  props: { quizId: String },
  setup(props) {
    const { currentUser } = useAuth();
    const {
      fetchQuiz, currentQuiz, currentQuestions, currentQuestion,
      currentQuestionIndex, userAnswers, isLoading, error,
      currentScore, totalPossibleScore, isQuizCompleted,
      goToNextQuestion, goToPreviousQuestion, answerQuestion
    } = useQuiz();
    
    const quizCompleted = ref(false);
    const timerRef = ref(null);
    
    // Initialize quiz on component mount
    onMounted(() => fetchQuiz(props.quizId));
    
    // Handle answer selection
    const handleAnswerSelected = (ans) => answerQuestion(ans);
    
    // Complete the quiz and show results
    const completeQuiz = () => {
      timerRef.value?.pauseTimer();
      quizCompleted.value = true;
    };
    
    // Create safe user object for results
    const safeUser = computed(() => 
      !currentUser.value ? null : {
        uid: currentUser.value.uid,
        displayName: currentUser.value.displayName || 'Anonymous',
        email: currentUser.value.email || ''
      }
    );
    
    // Ensure timeLimit is a valid number
    const getValidDuration = () => {
      if (!currentQuiz.value || typeof currentQuiz.value.timeLimit !== 'number') {
        return 600; // Default 10 minutes in seconds
      }
      return Math.max(1, currentQuiz.value.timeLimit) * 60; // Ensure at least 1 minute
    };
    
    return {
      currentQuiz, currentQuestions, currentQuestion, currentQuestionIndex,
      userAnswers, isLoading, error, currentScore, totalPossibleScore,
      isQuizCompleted, goToNextQuestion, goToPreviousQuestion,
      handleAnswerSelected, completeQuiz, quizCompleted, timerRef, safeUser,
      getValidDuration
    };
  }
};
</script>

<style scoped>
.take-quiz {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 0;
}
.loading-state,
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
  border: 4px solid #eee;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.alert {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.95rem;
}
.alert-danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
.quiz-header {
  margin-bottom: 2rem;
  text-align: center;
}
.quiz-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}
.quiz-description {
  color: #6c757d;
  margin-bottom: 1rem;
}
.quiz-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1rem;
}
.meta-item {
  font-size: 1rem;
  color: #666;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.btn {
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;
  display: inline-block;
}
.btn-primary {
  background: var(--primary-color, #007bff);
  color: #fff;
}
.btn-primary:hover,
.btn-primary:focus {
  background: var(--primary-dark, #0056b3);
}
@media (max-width: 600px) {
  .take-quiz {
    padding: 1rem 0.2rem;
  }
  .quiz-header {
    margin-bottom: 1rem;
  }
}
</style>
