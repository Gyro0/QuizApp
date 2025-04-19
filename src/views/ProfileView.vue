<template>
  <div class="profile-page">
    <div class="container">
      <!-- État non connecté -->
      <div v-if="!currentUser" class="auth-required">
        <p>Veuillez vous connecter pour voir votre profil.</p>
        <router-link to="/login" class="btn btn-primary">Connexion</router-link>
      </div>

      <!-- État connecté -->
      <div v-else class="profile-content">
        <h1 class="page-title">Profil</h1>
        
        <div class="profile-grid">
          <!-- Carte d'information utilisateur -->
          <div class="user-card">
            <div class="user-avatar">
              <div class="avatar">{{ userInitials }}</div>
            </div>
            <h3 class="user-name">{{ currentUser.displayName }}</h3>
            <p class="user-email">{{ currentUser.email }}</p>
            <button class="btn btn-danger-outline" @click="handleLogout">
              Déconnexion
            </button>
          </div>

          <!-- Carte des statistiques -->
          <div class="stats-card">
            <h2 class="card-title">Vos Statistiques</h2>
            
            <!-- État de chargement -->
            <div v-if="isLoading" class="loading-state">
              <div class="spinner"></div>
            </div>

            <!-- Contenu -->
            <div v-else class="stats-content">
              <div class="stats-summary">
                <div class="stat-item">
                  <span class="stat-label">Quiz complétés</span>
                  <span class="stat-value">{{ userScores.length }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Score moyen</span>
                  <span class="stat-value">{{ averageScore }}%</span>
                </div>
              </div>

              <h3 class="section-title">Scores récents</h3>
              
              <!-- État vide -->
              <div v-if="userScores.length === 0" class="empty-state">
                <p>Vous n'avez pas encore participé à des quiz.</p>
                <router-link to="/" class="btn btn-primary">
                  Parcourir les Quiz
                </router-link>
              </div>
              
              <!-- Tableau des scores -->
              <div v-else class="scores-table">
                <table>
                  <thead>
                    <tr>
                      <th>Quiz</th>
                      <th>Score</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="score in userScores" :key="score.quizId">
                      <td>
                        <router-link :to="`/quiz/${score.quizId}`" class="quiz-link">
                          {{ score.quizTitle }}
                        </router-link>
                      </td>
                      <td>{{ score.score }}%</td>
                      <td>{{ formatDate(score.timestamp) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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

<style scoped>
.profile-page {
  padding: 2rem 0;
  min-height: calc(100vh - 160px);
  background-color: var(--background);
}

.auth-required {
  text-align: center;
  padding: 3rem;
  background-color: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  max-width: 400px;
  margin: 2rem auto;
}

.auth-required p {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

.page-title {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 2rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

.user-card {
  background-color: var(--white);
  padding: 2rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  text-align: center;
}

.user-avatar {
  margin-bottom: 1.5rem;
}

.avatar {
  width: 96px;
  height: 96px;
  background-color: var(--primary-color);
  color: var(--white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
  margin: 0 auto;
}

.user-name {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.user-email {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.stats-card {
  background-color: var(--white);
  padding: 2rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.card-title {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--secondary-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-item {
  padding: 1rem;
  background-color: var(--background);
  border-radius: var(--radius-md);
  text-align: center;
}

.stat-label {
  display: block;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.section-title {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.scores-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--secondary-color);
}

th {
  font-weight: 600;
  color: var(--text-primary);
  background-color: var(--background);
}

.quiz-link {
  color: var(--primary-color);
  text-decoration: none;
}

.quiz-link:hover {
  text-decoration: underline;
}

.btn-danger-outline {
  color: var(--error-color);
  border: 1px solid var(--error-color);
  background-color: transparent;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.btn-danger-outline:hover {
  background-color: var(--error-color);
  color: var(--white);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .stats-card,
  .user-card {
    padding: 1.5rem;
  }

  .scores-table {
    margin: 0 -1.5rem;
  }

  table {
    font-size: 0.875rem;
  }

  th, td {
    padding: 0.75rem;
  }
}
</style>