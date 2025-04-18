<template>
  <div class="quiz-results">
    <b-card class="text-center">
      <!-- Results Header -->
      <h2 class="mb-4">Quiz Results</h2>
      
      <!-- Score Circle -->
      <div class="result-summary mb-4">
        <div class="score-circle" :class="scoreClass">
          <div class="score-value">{{ score }} / {{ totalQuestions }}</div>
          <div class="score-percent">{{ scorePercentage }}%</div>
        </div>
        <h3 class="mt-3">{{ resultMessage }}</h3>
        <p>{{ timeSpent }}</p>
      </div>
      
      <!-- Stats Summary -->
      <b-list-group class="mb-4">
        <b-list-group-item class="d-flex justify-content-between">
          <span>Total Questions</span>
          <b-badge variant="primary">{{ totalQuestions }}</b-badge>
        </b-list-group-item>
        <b-list-group-item class="d-flex justify-content-between">
          <span>Correct Answers</span>
          <b-badge variant="success">{{ score }}</b-badge>
        </b-list-group-item>
        <b-list-group-item class="d-flex justify-content-between">
          <span>Incorrect Answers</span>
          <b-badge variant="danger">{{ totalQuestions - score }}</b-badge>
        </b-list-group-item>
      </b-list-group>
      
      <!-- Rank Display -->
      <div v-if="rank" class="leaderboard-info mb-4">
        <h4>Your Ranking</h4>
        <p>You are ranked #{{ rank.rank }} out of {{ rank.total }} participants</p>
      </div>
      
      <!-- Action Buttons -->
      <div class="actions">
        <b-button variant="primary" class="mr-2" @click="viewLeaderboard">View Leaderboard</b-button>
        <b-button variant="success" class="mr-2" @click="retakeQuiz">Retake Quiz</b-button>
        <b-button variant="outline-secondary" @click="goHome">Back to Home</b-button>
      </div>
      
      <!-- Question Review (Collapsible) -->
      <b-button 
        variant="outline-primary" 
        block 
        @click="showAnswers = !showAnswers" 
        class="my-3"
      >
        {{ showAnswers ? 'Hide' : 'Show' }} Answer Review
      </b-button>
      
      <b-collapse v-model="showAnswers" class="mt-2">
        <h4 class="mb-3">Question Review</h4>
        <div v-for="(question, index) in questions" :key="index" class="question-review mb-3">
          <b-card 
            :bg="userAnswers[index] === question.correctAnswer ? 'success' : 'danger'"
            text="white"
          >
            <h5>Question {{ index + 1 }}: {{ question.text }}</h5>
            <p>Your answer: {{ userAnswers[index] || 'Not answered' }}</p>
            <p>Correct answer: {{ question.correctAnswer }}</p>
          </b-card>
        </div>
      </b-collapse>
    </b-card>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useLeaderboard } from '@/composables/useLeaderboard';
import { db } from '@/firebase/firebaseInit';

export default {
  name: 'QuizResults',
  props: {
    quizId: { type: String, required: true },
    quizTitle: { type: String, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    questions: { type: Array, required: true },
    userAnswers: { type: Array, required: true },
    timeSpent: { type: String, default: '' },
    user: { type: Object, default: null }
  },
  setup(props) {
    const router = useRouter();
    const { getUserRank } = useLeaderboard();
    
    // UI state
    const showAnswers = ref(false);
    const rank = ref(null);
    const scoreSubmitted = ref(false);
    
    // Computed values for score display
    const scorePercentage = computed(() => 
      Math.round((props.score / props.totalQuestions) * 100)
    );
    
    const scoreClass = computed(() => {
      const percent = scorePercentage.value;
      if (percent >= 80) return 'excellent';
      if (percent >= 60) return 'good';
      if (percent >= 40) return 'average';
      return 'poor';
    });
    
    const resultMessage = computed(() => {
      const percent = scorePercentage.value;
      if (percent >= 80) return 'Excellent!';
      if (percent >= 60) return 'Good job!';
      if (percent >= 40) return 'Not bad!';
      return 'Keep practicing!';
    });
    
    // Save score to Firebase
    const saveScore = async () => {
      // Early return if unable to save
      if (!props.user?.uid || !props.quizId || scoreSubmitted.value) {
        return;
      }
      
      try {
        // Create document with validated data
        const safeData = {
          quizId: String(props.quizId),
          quizTitle: String(props.quizTitle || 'Untitled Quiz'),
          userId: String(props.user.uid),
          displayName: props.user.displayName?.trim() || 'Anonymous User',
          score: Number(props.score),
          totalQuestions: Number(props.totalQuestions),
          timestamp: new Date(),
          createdAt: new Date()
        };
        
        // Direct Firebase write
        await db.collection('leaderboard').add(safeData);
        scoreSubmitted.value = true;
        
        // Get user's rank after saving score
        try {
          rank.value = await getUserRank(props.quizId, props.user.uid);
        } catch (err) {
          console.error('Error fetching rank:', err);
        }
      } catch (err) {
        console.error('Failed to save score:', err);
      }
    };
    
    // Save score when user data is available
    if (props.user?.uid) {
      saveScore();
    }
    
    // Watch for user becoming defined
    watch(() => props.user, (newUser) => {
      if (newUser?.uid && !scoreSubmitted.value) {
        saveScore();
      }
    });

    // Navigation methods
    const viewLeaderboard = () => router.push(`/leaderboard/${props.quizId}`);
    const retakeQuiz = () => router.push(`/quiz/${props.quizId}`);
    const goHome = () => router.push('/');
    
    return {
      showAnswers,
      rank,
      scorePercentage,
      scoreClass,
      resultMessage,
      viewLeaderboard,
      retakeQuiz,
      goHome
    };
  }
};
</script>

<style scoped>
.quiz-results {
  max-width: 800px;
  margin: 0 auto;
}

.result-summary {
  padding: 20px 0;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  color: white;
}

/* Score circle color classes */
.score-circle.excellent { background-color: #28a745; }
.score-circle.good { background-color: #17a2b8; }
.score-circle.average { 
  background-color: #ffc107; 
  color: #212529; 
}
.score-circle.poor { background-color: #dc3545; }

.score-value {
  font-size: 24px;
  font-weight: bold;
}

.score-percent {
  font-size: 18px;
}

.question-review {
  text-align: left;
}

.actions {
  margin-bottom: 20px;
}
</style>