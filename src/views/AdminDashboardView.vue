<template>
  <div class="admin-dashboard container">
    <h1 class="title">Admin Dashboard</h1>

    <div v-if="!currentUser || !isAdmin" class="access-denied">
      <div class="alert alert-danger">
        <h4>Access Denied</h4>
        <p>You do not have permission to access this page.</p>
      </div>
      <button class="btn btn-primary" @click="$router.push('/')">Return to Home</button>
    </div>

    <div v-else>
      <div class="stats-summary">
        <div class="stat-card">
          <h2>{{ dashboardData.totalUsers }}</h2>
          <p>Total Users</p>
        </div>
        <div class="stat-card">
          <h2>{{ dashboardData.totalQuizzes }}</h2>
          <p>Total Quizzes</p>
        </div>
      </div>

      <div class="management-cards">
        <div class="card">
          <h3>Quiz Management</h3>
          <p>Create, edit, and manage quizzes.</p>
          <div class="actions">
            <button class="btn btn-primary" @click="$router.push('/admin/quizzes')">
              
              Manage Quizzes
            </button>
            <button class="btn btn-success" @click="$router.push('/admin/quizzes/create')">
              
              Create Quiz
            </button>
          </div>
        </div>
        <div class="card">
          <h3>User Management</h3>
          <p>View and manage user accounts.</p>
          <div class="actions">
            <button class="btn btn-primary" @click="$router.push('/admin/users')">
              
              Manage Users
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useFirestore } from '@/composables/useFirestore';

export default {
  name: 'AdminDashboardView',
  setup() {
    const { currentUser, isAdmin } = useAuth();
    const usersFirestore = useFirestore('users');
    const quizzesFirestore = useFirestore('quizzes');
    const scoresFirestore = useFirestore('leaderboard');

    const isLoading = ref(true);
    const error = ref(null);
    const dashboardData = ref({
      totalUsers: 0,
      totalQuizzes: 0,
      recentScores: []
    });

    const scoreFields = [
      { key: 'displayName', label: 'User' },
      { key: 'quizTitle', label: 'Quiz' },
      { key: 'score', label: 'Score' },
      { key: 'timestamp', label: 'Date' }
    ];

    const loadRecentData = async () => {
      isLoading.value = true;
      error.value = null;

      try {
        // Get recent scores
        const scores = await scoresFirestore.getItems([
          { name: 'orderBy', field: 'timestamp', direction: 'desc' },
          { name: 'limit', value: 10 }
        ]);
        dashboardData.value.recentScores = scores;

        // Get total users and quizzes count
        const users = await usersFirestore.getItems();
        const quizzes = await quizzesFirestore.getItems();

        dashboardData.value.totalUsers = users.length;
        dashboardData.value.totalQuizzes = quizzes.length;
      } catch (err) {
        console.error('Error loading admin dashboard data:', err);
        error.value = err.message;
      } finally {
        isLoading.value = false;
      }
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    };

    onMounted(loadRecentData);

    return {
      currentUser,
      isAdmin,
      dashboardData,
      isLoading,
      error,
      scoreFields,
      formatDate
    };
  }
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  font-size: 2rem;
  margin-bottom: 20px;
}

.access-denied {
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

.stats-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  flex: 1;
  padding: 20px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  text-align: center;
}

.stat-card h2 {
  font-size: 2rem;
  margin-bottom: 10px;
}

.management-cards {
  display: flex;
  gap: 20px;
}

.card {
  flex: 1;
  padding: 32px 28px;
  background: linear-gradient(90deg, #f8f9fa 80%, #e3f0ff 100%);
  border-left: 5px solid #007bff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s, transform 0.2s;
  display: flex;
  flex-direction: column;
  gap: 18px; /* Space between children */
}

.card:hover {
  box-shadow: 0 6px 24px rgba(0,0,0,0.12);
  transform: translateY(-2px) scale(1.02);
}

.actions {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  font-size: 1.1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: background 0.2s, transform 0.2s;
}

.btn-primary {
  background: linear-gradient(90deg, #007bff 80%, #0056b3 100%);
  color: white;
}

.btn-success {
  background: linear-gradient(90deg, #28a745 80%, #218838 100%);
  color: white;
}

.btn:hover {
  transform: translateY(-2px) scale(1.04);
  filter: brightness(1.08);
}

.material-icons {
  font-size: 1.3em;
  vertical-align: middle;
}
</style>