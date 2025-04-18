<template>
  <div class="take-quiz">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center my-5">
      <b-spinner variant="primary" label="Loading quiz..."></b-spinner>
      <p class="mt-2">Loading quiz...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    
    <!-- Not Found State -->
    <div v-else-if="!currentQuiz" class="text-center my-5">
      <p>Quiz not found.</p>
      <b-button variant="primary" to="/">Back to Home</b-button>
    </div>
    
    <!-- Quiz Content -->
    <div v-else>
      <!-- Quiz In Progress -->
      <div v-if="!quizCompleted">
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
    
    return {
      currentQuiz, currentQuestions, currentQuestion, currentQuestionIndex,
      userAnswers, isLoading, error, currentScore, totalPossibleScore,
      isQuizCompleted, goToNextQuestion, goToPreviousQuestion,
      handleAnswerSelected, completeQuiz, quizCompleted, timerRef, safeUser
    };
  }
};
</script>

<style scoped>
.take-quiz {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}
</style>
