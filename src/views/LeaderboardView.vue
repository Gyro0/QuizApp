<template>
  <div class="leaderboard">
    <b-container>
      <h1 class="mb-4">Leaderboard</h1>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center my-5">
        <b-spinner variant="primary" label="Loading leaderboard..."></b-spinner>
        <p class="mt-2">Loading leaderboard...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <!-- Content State -->
      <div v-else>
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>{{ quizTitle || 'Global Leaderboard' }}</h2>
          <b-button v-if="quizId" variant="outline-primary" @click="goBack">
            Back to Quiz
          </b-button>
        </div>

        <b-card>
          <b-table v-if="leaderboard.length > 0" :items="leaderboard" :fields="fields" striped hover responsive>
            <!-- Rank Column -->
            <template #cell(rank)="data">
              <strong>{{ data.index + 1 }}</strong>
            </template>

            <!-- User Column -->
            <template #cell(displayName)="data">
              <div class="d-flex align-items-center">
                <strong>{{ data.item.displayName }}</strong>
                <b-badge v-if="data.item.userId === currentUser?.uid" variant="primary" class="ml-2">You</b-badge>
              </div>
            </template>

            <!-- Score Column -->
            <template #cell(score)="data">
              <b-badge variant="success" pill>{{ data.item.score }}</b-badge>
            </template>

            <!-- Date Column -->
            <template #cell(timestamp)="data">
              {{ formatDate(data.item.timestamp) }}
            </template>
          </b-table>

          <!-- User Ranking Box -->
          <div v-if="userRank" class="mt-4 p-3 bg-light rounded">
            <h4>Your Ranking</h4>
            <p class="mb-0">
              You are ranked <b>#{{ userRank.rank }}</b> out of {{ userRank.total }} participants
              with a score of <b-badge variant="success">{{ userRank.score }}</b-badge>
            </p>
          </div>

          <!-- Empty State -->
          <div v-if="leaderboard.length === 0" class="text-center my-4">
            <p>No scores to display yet. Be the first to take this quiz!</p>
          </div>
        </b-card>
      </div>
    </b-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLeaderboard } from '@/composables/useLeaderboard';
import { useFirestore } from '@/composables/useFirestore';
import { useAuth } from '@/composables/useAuth';
import { db } from '@/firebase/firebaseInit';

export default {
  name: 'LeaderboardView',
  setup() {
    // Router and parameters
    const route = useRoute();
    const router = useRouter();
    const quizId = route.params.id;
    
    // State
    const quizTitle = ref('');
    const userRank = ref(null);
    
    // Composables
    const { currentUser } = useAuth();
    const { fetchLeaderboard, leaderboard, error, isLoading, getUserRank } = useLeaderboard();
    const quizzesFirestore = useFirestore('quizzes');
    
    // Table configuration
    const fields = [
      { key: 'rank', label: 'Rank' },
      { key: 'displayName', label: 'User' },
      { key: 'score', label: 'Score' },
      { key: 'timestamp', label: 'Date' },
    ];

    // Load leaderboard data
    const loadLeaderboard = async () => {
      try {
        await fetchLeaderboard(quizId, 50);
        
        if (quizId) {
          // Get quiz title if specific quiz
          const quiz = await quizzesFirestore.getItem(quizId);
          if (quiz) quizTitle.value = quiz.title;
          
          // Get user's rank if logged in
          if (currentUser.value?.uid) {
            userRank.value = await getUserRank(quizId, currentUser.value.uid);
          }
        }
      } catch (err) {
        console.error('Error loading leaderboard:', err);
      }
    };

    // Navigation
    const goBack = () => router.push(quizId ? `/quiz/${quizId}` : '/');

    // Format timestamp to readable date
    const formatDate = timestamp => {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    };

    // Fallback for adding scores directly to Firebase
    const failsafeAddScore = async (data) => {
      try {
        const safeData = {
          quizId: String(data.quizId || 'unknown'),
          quizTitle: String(data.quizTitle || 'Untitled Quiz'),
          userId: String(data.userId || 'anonymous'),
          displayName: data.displayName?.trim() || 'Anonymous User',
          score: Number(data.score || 0),
          totalQuestions: Number(data.totalQuestions || 0),
          timestamp: new Date()
        };
        
        return await db.collection('leaderboard').add(safeData);
      } catch (err) {
        console.error('Failsafe write failed:', err);
        return null;
      }
    };

    onMounted(loadLeaderboard);

    return {
      quizId,
      quizTitle,
      leaderboard,
      error,
      isLoading,
      userRank,
      currentUser,
      fields,
      goBack,
      formatDate,
      failsafeAddScore
    };
  }
};
</script>