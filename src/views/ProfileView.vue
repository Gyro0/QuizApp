<template>
  <div class="profile">
    <b-container>
      <!-- Not logged in state -->
      <div v-if="!currentUser" class="text-center my-5">
        <p>Please login to view your profile.</p>
        <b-button variant="primary" to="/login">Login</b-button>
      </div>

      <!-- Logged in state -->
      <div v-else>
        <h1 class="mb-4">Profile</h1>
        <b-row>
          <!-- User info card -->
          <b-col md="4">
            <b-card>
              <div class="text-center mb-3">
                <b-avatar size="6rem" :text="userInitials" variant="primary"></b-avatar>
              </div>
              <h3 class="text-center">{{ currentUser.displayName }}</h3>
              <p class="text-center text-muted">{{ currentUser.email }}</p>
              <b-button block variant="outline-danger" @click="handleLogout">Logout</b-button>
            </b-card>
          </b-col>

          <!-- Statistics card -->
          <b-col md="8">
            <b-card title="Your Statistics">
              <!-- Loading state -->
              <div v-if="isLoading" class="text-center">
                <b-spinner variant="primary"></b-spinner>
              </div>

              <!-- Content state -->
              <div v-else>
                <div class="mb-4">
                  <h4>Quizzes Taken: {{ userScores.length }}</h4>
                  <h4>Average Score: {{ averageScore }}%</h4>
                </div>

                <h4>Recent Scores</h4>
                
                <!-- Empty state -->
                <div v-if="userScores.length === 0" class="text-center my-4">
                  <p>You haven't taken any quizzes yet.</p>
                  <b-button variant="primary" to="/">Browse Quizzes</b-button>
                </div>
                
                <!-- Scores table -->
                <b-table v-else :items="userScores" :fields="fields" striped hover responsive>
                  <template #cell(quizTitle)="data">
                    <router-link :to="`/quiz/${data.item.quizId}`">
                      {{ data.item.quizTitle }}
                    </router-link>
                  </template>
                  <template #cell(timestamp)="data">
                    {{ formatDate(data.item.timestamp) }}
                  </template>
                </b-table>
              </div>
            </b-card>
          </b-col>
        </b-row>
      </div>
    </b-container>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useLeaderboard } from '@/composables/useLeaderboard';

export default {
  name: 'ProfileView',
  setup() {
    const router = useRouter();
    const { currentUser, logout } = useAuth();
    const { fetchUserBestScores } = useLeaderboard();

    const userScores = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    const fields = [
      { key: 'quizTitle', label: 'Quiz' },
      { key: 'score', label: 'Score' },
      { key: 'timestamp', label: 'Date' }
    ];

    const userInitials = computed(() => {
      if (!currentUser.value || !currentUser.value.displayName) return '';

      const names = currentUser.value.displayName.split(' ');
      if (names.length === 1) return names[0].charAt(0).toUpperCase();

      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    });

    const averageScore = computed(() => {
      if (!userScores.value.length) return 0;

      const sum = userScores.value.reduce((acc, score) => acc + score.score, 0);
      return Math.round(sum / userScores.value.length);
    });

    const loadUserScores = async () => {
      if (!currentUser.value || !currentUser.value.uid) {
        console.log('Cannot fetch scores - no logged in user');
        return;
      }

      isLoading.value = true;

      try {
        console.log('Fetching scores for user:', currentUser.value.uid);
        const scores = await fetchUserBestScores(currentUser.value.uid);
        console.log('User scores fetched:', scores);
        userScores.value = scores;
      } catch (err) {
        console.error('Error fetching user scores:', err);
        error.value = err.message;
      } finally {
        isLoading.value = false;
      }
    };

    const handleLogout = async () => {
      await logout();
      router.push('/');
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return '';

      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    };

    onMounted(loadUserScores);

    return {
      currentUser,
      userScores,
      isLoading,
      error,
      userInitials,
      averageScore,
      fields,
      handleLogout,
      formatDate
    };
  }
};
</script>