import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '@/firebase/firebaseInit';
import { useFirestore } from '@/composables/useFirestore';

// Views
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import TakeQuizView from '@/views/TakeQuizView.vue';
import LeaderboardView from '@/views/LeaderboardView.vue';
import ProfileView from '@/views/ProfileView.vue';
import AdminDashboardView from '@/views/AdminDashboardView.vue';
import AdminQuizManagementView from '@/views/AdminQuizManagementView.vue';
import AdminQuestionManagementView from '@/views/AdminQuestionManagementView.vue';
import AdminImportQuizView from '@/views/AdminImportQuizView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import QuizDetailView from '@/views/QuizDetailView.vue'; // Import the new view

// Define a fallback component for routes that are still in development
const DevelopmentView = {
  template: `
    <div class="container mt-5">
      <div class="alert alert-warning">
        <h4>Under Construction</h4>
        <p>This feature is currently under development. Please check back soon!</p>
        <button class="btn btn-primary" @click="$router.back()">Go Back</button>
      </div>
    </div>
  `
};

const routes = [
  // Public routes
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guestOnly: true }
  },
  {
    path: '/quiz/:id',
    name: 'take-quiz',
    component: TakeQuizView,
    props: true,
    meta: { requiresAuth: true } // Assuming taking a quiz requires login
  },
  {
    path: '/quiz/detail/:id', // New route for quiz details
    name: 'quiz-detail',
    component: QuizDetailView,
    props: true // Pass route params as props
  },
  {
    path: '/leaderboard',
    name: 'global-leaderboard',
    component: LeaderboardView
  },
  {
    path: '/leaderboard/:id',
    name: 'quiz-leaderboard',
    component: LeaderboardView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  
  // Admin routes
  {
    path: '/admin',
    name: 'admin',
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: AdminDashboardView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/quizzes',
    name: 'admin-quizzes',
    component: AdminQuizManagementView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/quizzes/create',
    name: 'admin-create-quiz',
    component: () => import('@/views/AdminCreateQuizView.vue'), // Change from DevelopmentView
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/quizzes/edit/:id',
    name: 'admin-edit-quiz',
    component: () => import('@/views/AdminEditQuizView.vue'), // Change from DevelopmentView
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/questions/:id',
    name: 'admin-questions',
    component: AdminQuestionManagementView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/views/AdminUserManagementView.vue'), // Change from DevelopmentView
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/statistics',
    name: 'admin-statistics',
    component: DevelopmentView, // Use placeholder while in development
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  
  // Not found route
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView
  },
  {
    path: '/admin/quizzes/import',
    name: 'admin-import-quiz',
    component: AdminImportQuizView,
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const guestOnly = to.matched.some(record => record.meta.guestOnly);
  
  // Wait for auth state to initialize before routing
  const currentUser = auth.currentUser;
  
  // Guest only routes check
  if (guestOnly && currentUser) {
    next('/');
    return;
  }
  
  // Authentication check
  if (requiresAuth && !currentUser) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
    return;
  }
  
  // Admin role check
  if (requiresAdmin) {
    if (!currentUser) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
      return;
    }
    
    try {
      const { getItem } = useFirestore('users');
      const userData = await getItem(currentUser.uid);
      
      if (!userData || userData.role !== 'admin') {
        next('/');
        return;
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      next('/');
      return;
    }
  }
  
  next();
});

export default router;