<template>
  <div class="admin-dashboard">
    <b-container>
      <h1 class="mb-4">Admin Dashboard</h1>
      
      <div v-if="!currentUser || !isAdmin" class="text-center my-5">
        <b-alert show variant="danger">
          <h4>Access Denied</h4>
          <p>You do not have permission to access this page.</p>
        </b-alert>
        <b-button variant="primary" to="/">Return to Home</b-button>
      </div>
      
      <div v-else>
        <!-- Stats Summary -->
        <b-row class="mb-4">
          <b-col md="6">
            <b-card bg-variant="primary" text-variant="white" class="text-center">
              <h2>{{ dashboardData.totalUsers }}</h2>
              <p class="mb-0">Total Users</p>
            </b-card>
          </b-col>
          <b-col md="6">
            <b-card bg-variant="success" text-variant="white" class="text-center">
              <h2>{{ dashboardData.totalQuizzes }}</h2>
              <p class="mb-0">Total Quizzes</p>
            </b-card>
          </b-col>
        </b-row>
        
        <!-- Management Cards -->
        <b-row>
          <b-col md="6" class="mb-4">
            <b-card title="Quiz Management" class="h-100">
              <b-card-text>
                Create, edit, and manage quizzes. Add or remove questions and set quiz parameters.
              </b-card-text>
              <div class="d-flex flex-wrap">
                <b-button variant="primary" to="/admin/quizzes" class="mr-2 mb-2">
                  Manage Quizzes
                </b-button>
                <b-button variant="success" to="/admin/quizzes/create" class="mr-2 mb-2">
                  <i class="fas fa-plus-circle"></i> Create Quiz
                </b-button>
                <b-button variant="info" to="/admin/quizzes/import" class="mb-2">
                  <i class="fas fa-cloud-download-alt"></i> Import Quiz
                </b-button>
              </div>
            </b-card>
          </b-col>
          
          <b-col md="6" class="mb-4">
            <b-card title="User Management" class="h-100">
              <b-card-text>
                View and manage user accounts. Change roles and permissions.
              </b-card-text>
              <b-button variant="primary" to="/admin/users">
                Manage Users
              </b-button>
            </b-card>
          </b-col>
        </b-row>
        
        <!-- Recent Activity -->
        <b-row>
          <b-col>
            <b-card title="Recent Activity">
              <div v-if="isLoading" class="text-center my-4">
                <b-spinner variant="primary"></b-spinner>
              </div>
              <div v-else-if="dashboardData.recentScores.length === 0" class="text-center py-4">
                <p class="mb-0 text-muted">No recent quiz attempts yet.</p>
              </div>
              <b-table
                v-else
                :items="dashboardData.recentScores"
                :fields="scoreFields"
                striped
                hover
                responsive
              >
                <template #cell(timestamp)="data">
                  {{ formatDate(data.item.timestamp) }}
                </template>
              </b-table>
            </b-card>
          </b-col>
        </b-row>
      </div>
    </b-container>
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