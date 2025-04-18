<template>
  <b-card 
    :title="quiz.title" 
    :img-src="quiz.imageUrl" 
    :img-alt="quiz.title"
    img-top
    class="h-100 quiz-card"
  >
    <b-card-text>
      <!-- Display quiz description -->
      <p>{{ quiz.description }}</p>
      <!-- Display question count and creation date -->
      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">{{ quiz.questions }} Questions</small>
        <small class="text-muted">{{ formatDate(quiz.createdAt) }}</small>
      </div>
    </b-card-text>
    
    <!-- Card Footer with Action Buttons -->
    <template #footer>
      <div class="d-flex justify-content-between">
        <b-button variant="primary" @click="startQuiz">
          Start Quiz
        </b-button>
        <b-button variant="outline-secondary" @click="viewLeaderboard">
          Leaderboard
        </b-button>
      </div>
    </template>
  </b-card>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'QuizCard',
  props: {
    // The quiz object containing details to display
    quiz: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter();

    // Navigates to the quiz taking page
    const startQuiz = () => {
      router.push(`/quiz/${props.quiz.id}`);
    };

    // Navigates to the leaderboard page for this quiz
    const viewLeaderboard = () => {
      router.push(`/leaderboard/${props.quiz.id}`);
    };

    // Formats a Firestore timestamp or Date object into a readable date string
    const formatDate = (timestamp) => {
      if (!timestamp) return ''; // Return empty if no timestamp
      // Convert Firestore Timestamp to Date if necessary
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString(); // Use locale-specific date format
    };

    // Expose methods to the template
    return {
      startQuiz,
      viewLeaderboard,
      formatDate
    };
  }
};
</script>

<style scoped>
.quiz-card {
  /* Add a subtle transition for the hover effect */
  transition: transform 0.3s ease;
}

.quiz-card:hover {
  /* Slightly lift the card on hover */
  transform: translateY(-5px);
  /* Add a soft shadow on hover */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
</style>