<template>
  <div class="leaderboard container">
    <h1 class="title">Leaderboard</h1>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <p>Loading leaderboard...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      <p>{{ error }}</p>
    </div>

    <!-- Leaderboard Content -->
    <div v-else>
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th>Score</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(entry, index) in leaderboard" :key="entry.id">
            <td>{{ index + 1 }}</td>
            <td>{{ entry.displayName }}</td>
            <td>{{ entry.score }}</td>
            <td>{{ formatDate(entry.timestamp) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
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

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  font-size: 2rem;
  margin-bottom: 20px;
  text-align: center;
}

.loading-state {
  text-align: center;
  margin-top: 50px;
}

.alert {
  padding: 20px;
  border: 1px solid #f5c6cb;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 5px;
  margin-bottom: 20px;
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.leaderboard-table th,
.leaderboard-table td {
  border: 1px solid #dee2e6;
  padding: 10px;
  text-align: center;
}

.leaderboard-table th {
  background-color: #f8f9fa;
}

.leaderboard-table tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>