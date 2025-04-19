<template>
  <div class="quiz-results">
    <div class="results-card">
      <!-- Results Header -->
      <h2 class="results-title">Quiz Results</h2>
      
      <!-- Score Circle -->
      <div class="result-summary">
        <div class="score-circle" :class="scoreClass">
          <div class="score-value">{{ score }} / {{ totalQuestions }}</div>
          <div class="score-percent">{{ scorePercentage }}%</div>
        </div>
        <h3 class="result-message">{{ resultMessage }}</h3>
        <p class="time-spent">{{ timeSpent }}</p>
      </div>
      
      <!-- Stats Summary -->
      <div class="stats-summary">
        <div class="stat-row">
          <span>Total Questions</span>
          <span class="badge badge-primary">{{ totalQuestions }}</span>
        </div>
        <div class="stat-row">
          <span>Correct Answers</span>
          <span class="badge badge-success">{{ score }}</span>
        </div>
        <div class="stat-row">
          <span>Incorrect Answers</span>
          <span class="badge badge-danger">{{ totalQuestions - score }}</span>
        </div>
      </div>
      
      <!-- Rank Display -->
      <div v-if="rank" class="leaderboard-info">
        <h4>Your Ranking</h4>
        <p>You are ranked #{{ rank.rank }} out of {{ rank.total }} participants</p>
      </div>
      
      <!-- Action Buttons -->
      <div class="actions">
        <button class="btn btn-primary" @click="viewLeaderboard">View Leaderboard</button>
        <button class="btn btn-success" @click="retakeQuiz">Retake Quiz</button>
        <button class="btn btn-secondary" @click="goHome">Back to Home</button>
      </div>
      
      <!-- Question Review (Collapsible) -->
      <button 
        class="btn btn-outline-primary btn-block my-3"
        @click="showAnswers = !showAnswers"
      >
        {{ showAnswers ? 'Hide' : 'Show' }} Answer Review
      </button>
      <transition name="fade">
        <div v-if="showAnswers" class="question-review-list">
          <h4 class="mb-3">Question Review</h4>
          <div v-for="(question, index) in questions" :key="index" class="question-review">
            <div
              class="review-card"
              :class="userAnswers[index] === question.correctAnswer ? 'review-success' : 'review-danger'"
            >
              <h5>Question {{ index + 1 }}: {{ question.text }}</h5>
              <p>Your answer: <span :class="userAnswers[index] === question.correctAnswer ? 'text-success' : 'text-danger'">
                {{ userAnswers[index] || 'Not answered' }}
              </span></p>
              <p>Correct answer: <span class="text-success">{{ question.correctAnswer }}</span></p>
            </div>
          </div>
        </div>
      </transition>
    </div>
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
    const showAnswers = ref(false);
    const rank = ref(null);
    const scoreSubmitted = ref(false);

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
      if (!props.user?.uid || !props.quizId || scoreSubmitted.value) return;
      try {
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
        await db.collection('leaderboard').add(safeData);
        scoreSubmitted.value = true;
        try {
          rank.value = await getUserRank(props.quizId, props.user.uid);
        } catch (err) {
          // silent
        }
      } catch (err) {
        // silent
      }
    };

    if (props.user?.uid) saveScore();
    watch(() => props.user, (newUser) => {
      if (newUser?.uid && !scoreSubmitted.value) saveScore();
    });

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
  padding: 2rem 0;
}
.results-card {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  padding: 2.5rem 2rem;
  text-align: center;
}
.results-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}
.result-summary {
  margin-bottom: 2rem;
}
.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto 1rem auto;
  color: #fff;
  font-weight: 600;
  font-size: 1.2rem;
}
.score-circle.excellent { background-color: #28a745; }
.score-circle.good { background-color: #17a2b8; }
.score-circle.average { background-color: #ffc107; color: #212529; }
.score-circle.poor { background-color: #dc3545; }
.score-value {
  font-size: 2rem;
  font-weight: bold;
}
.score-percent {
  font-size: 1.2rem;
}
.result-message {
  margin-top: 1rem;
  font-size: 1.3rem;
  font-weight: 600;
}
.time-spent {
  color: #6c757d;
  margin-bottom: 0.5rem;
}
.stats-summary {
  margin: 2rem 0 1.5rem 0;
}
.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 1.2rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 1.05rem;
}
.badge {
  display: inline-block;
  padding: 0.3em 0.9em;
  font-size: 1em;
  border-radius: 0.25em;
  font-weight: 600;
}
.badge-primary { background: #007bff; color: #fff; }
.badge-success { background: #28a745; color: #fff; }
.badge-danger { background: #dc3545; color: #fff; }
.leaderboard-info {
  margin-bottom: 1.5rem;
  background: #f1f3f5;
  border-radius: 0.5rem;
  padding: 1rem;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}
.btn {
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  font-weight: 500;
  outline: none;
}
.btn-primary {
  background: var(--primary-color, #007bff);
  color: #fff;
}
.btn-success {
  background: #28a745;
  color: #fff;
}
.btn-secondary {
  background: #6c757d;
  color: #fff;
}
.btn-outline-primary {
  background: #fff;
  color: #007bff;
  border: 1.5px solid #007bff;
}
.btn-outline-primary:hover {
  background: #007bff;
  color: #fff;
}
.btn-block {
  width: 100%;
}
.my-3 {
  margin-top: 1.2rem;
  margin-bottom: 1.2rem;
}
.question-review-list {
  margin-top: 1.5rem;
  text-align: left;
}
.question-review {
  margin-bottom: 1rem;
}
.review-card {
  border-radius: 0.5rem;
  padding: 1.2rem;
  color: #fff;
}
.review-success {
  background: #28a745;
}
.review-danger {
  background: #dc3545;
}
.text-success { color: #d4edda; }
.text-danger { color: #f8d7da; }
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
@media (max-width: 600px) {
  .results-card {
    padding: 1rem 0.5rem;
  }
  .score-circle {
    width: 110px;
    height: 110px;
    font-size: 1rem;
  }
}
</style>