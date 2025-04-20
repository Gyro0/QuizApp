<template>
  <div class="quiz-detail-view container mt-4">
    <!-- Loading State -->
    <div v-if="isLoadingQuiz || isLoadingParticipants" class="text-center my-5">
       <div class="spinner-border text-primary" role="status">
         <span class="visually-hidden">Loading...</span>
       </div>
       <p class="mt-2">Loading quiz details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="quizError" class="alert alert-danger">
      {{ quizError }}
    </div>

    <!-- Not Found State -->
    <div v-else-if="!currentQuiz" class="alert alert-warning">
      Quiz not found.
    </div>

    <!-- Content State -->
    <div v-else class="row">
      <!-- Left Column: Quiz Details -->
      <div class="col-md-8">
        <div class="card">
          <img v-if="currentQuiz.imageUrl" :src="currentQuiz.imageUrl" class="card-img-top quiz-image" alt="Quiz Image">
          <div class="card-body">
            <h1 class="card-title quiz-title">{{ currentQuiz.title }}</h1>
            <p class="card-text quiz-description">{{ currentQuiz.description }}</p>
            <hr>
            <div class="quiz-meta">
              <span class="meta-item">
                <i class="fas fa-layer-group"></i> Category: <strong>{{ currentQuiz.category }}</strong>
              </span>
              <span v-if="currentQuiz.difficulty" class="meta-item">
                <i class="fas fa-tachometer-alt"></i> Difficulty: <strong>{{ currentQuiz.difficulty }}</strong>
              </span>
              <span class="meta-item">
                <i class="fas fa-question-circle"></i> Questions: <strong>{{ currentQuestions.length }}</strong>
              </span>
               <span class="meta-item">
                <i class="fas fa-clock"></i> Time Limit: <strong>{{ currentQuiz.timeLimit }} min</strong>
              </span>
              <span class="meta-item">
                <i class="fas fa-users"></i> Participants: <strong>{{ participantCount }}</strong>
              </span>
            </div>
            <div class="start-button-container mt-4">
              <button class="btn btn-primary btn-lg" @click="startQuiz">
                <i class="fas fa-play"></i> Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Leaderboard Snippet -->
      <div class="col-md-4">
        <LeaderboardSnippet :quiz-id="quizId" :limit="10" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuiz } from '@/composables/useQuiz';
import { useLeaderboard } from '@/composables/useLeaderboard';
import LeaderboardSnippet from '@/components/Quiz/LeaderboardSnippet.vue';

export default {
  name: 'QuizDetailView',
  components: { LeaderboardSnippet },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const quizId = route.params.id;

    const {
      fetchQuiz,
      currentQuiz,
      currentQuestions,
      isLoading: isLoadingQuiz,
      error: quizError
    } = useQuiz();

    const { getParticipantCount, isLoading: isLoadingParticipants } = useLeaderboard(); // Assuming getParticipantCount exists

    const participantCount = ref(0);

    const loadQuizData = async () => {
      await fetchQuiz(quizId);
      if (currentQuiz.value) {
         // Fetch participant count after quiz is loaded
         participantCount.value = await getParticipantCount(quizId);
      }
    };

    const startQuiz = () => {
      router.push(`/quiz/${quizId}`);
    };

    onMounted(loadQuizData);

    return {
      quizId,
      currentQuiz,
      currentQuestions,
      isLoadingQuiz,
      isLoadingParticipants, // Add this
      quizError,
      participantCount,
      startQuiz
    };
  }
};
</script>

<style scoped>
.quiz-detail-view {
  /* Add styles for the overall view container */
}

.quiz-image {
  max-height: 300px;
  object-fit: cover;
  border-top-left-radius: var(--bs-card-inner-border-radius);
  border-top-right-radius: var(--bs-card-inner-border-radius);
}

.quiz-title {
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.quiz-description {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 1.5rem;
}

.quiz-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.95rem;
  color: #333;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background-color: #f8f9fa;
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
  border: 1px solid #e9ecef;
}

.meta-item i {
  color: #007bff; /* Adjust icon color */
}

.start-button-container {
  text-align: center;
}

.btn-lg {
  padding: 0.8rem 2rem;
  font-size: 1.2rem;
}

/* Basic Bootstrap-like styles if not globally available */
.container { width: 100%; padding-right: var(--bs-gutter-x,.75rem); padding-left: var(--bs-gutter-x,.75rem); margin-right: auto; margin-left: auto; }
@media (min-width: 576px) { .container { max-width: 540px; } }
@media (min-width: 768px) { .container { max-width: 720px; } }
@media (min-width: 992px) { .container { max-width: 960px; } }
@media (min-width: 1200px) { .container { max-width: 1140px; } }
.mt-4 { margin-top: 1.5rem !important; }
.my-5 { margin-top: 3rem !important; margin-bottom: 3rem !important; }
.text-center { text-align: center !important; }
.spinner-border { display: inline-block; width: 2rem; height: 2rem; vertical-align: -0.125em; border: .25em solid currentColor; border-right-color: transparent; border-radius: 50%; animation: .75s linear infinite spinner-border; }
.text-primary { color: #0d6efd !important; }
.visually-hidden { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0,0,0,0) !important; white-space: nowrap !important; border: 0 !important; }
@keyframes spinner-border { to { transform: rotate(360deg); } }
.alert { position: relative; padding: 1rem 1rem; margin-bottom: 1rem; border: 1px solid transparent; border-radius: .25rem; }
.alert-danger { color: #842029; background-color: #f8d7da; border-color: #f5c2c7; }
.alert-warning { color: #664d03; background-color: #fff3cd; border-color: #ffecb5; }
.row { --bs-gutter-x: 1.5rem; --bs-gutter-y: 0; display: flex; flex-wrap: wrap; margin-top: calc(-1 * var(--bs-gutter-y)); margin-right: calc(-.5 * var(--bs-gutter-x)); margin-left: calc(-.5 * var(--bs-gutter-x)); }
.row > * { flex-shrink: 0; width: 100%; max-width: 100%; padding-right: calc(var(--bs-gutter-x) * .5); padding-left: calc(var(--bs-gutter-x) * .5); margin-top: var(--bs-gutter-y); }
.col-md-8 { flex: 0 0 auto; width: 66.66666667%; }
.col-md-4 { flex: 0 0 auto; width: 33.33333333%; }
.card { position: relative; display: flex; flex-direction: column; min-width: 0; word-wrap: break-word; background-color: #fff; background-clip: border-box; border: 1px solid rgba(0,0,0,.125); border-radius: .25rem; }
.card-img-top { width: 100%; border-top-left-radius: calc(.25rem - 1px); border-top-right-radius: calc(.25rem - 1px); }
.card-body { flex: 1 1 auto; padding: 1rem 1rem; }
.card-title { margin-bottom: .5rem; }
.card-text:last-child { margin-bottom: 0; }
hr { margin: 1rem 0; color: inherit; background-color: currentColor; border: 0; opacity: .25; height: 1px; }
.btn { display: inline-block; font-weight: 400; line-height: 1.5; color: #212529; text-align: center; text-decoration: none; vertical-align: middle; cursor: pointer; user-select: none; background-color: transparent; border: 1px solid transparent; padding: .375rem .75rem; font-size: 1rem; border-radius: .25rem; transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; }
.btn-primary { color: #fff; background-color: #0d6efd; border-color: #0d6efd; }
.btn-primary:hover { color: #fff; background-color: #0b5ed7; border-color: #0a58ca; }
.fas { /* Assuming Font Awesome is used */ font-family: 'Font Awesome 5 Free'; font-weight: 900; }
</style>
