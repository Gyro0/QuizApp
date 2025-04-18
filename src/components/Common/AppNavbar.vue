<template>
  <b-navbar toggleable="lg" type="dark" variant="primary" fixed="top">
    <b-container>
      <!-- Brand Logo/Link -->
      <b-navbar-brand to="/">QuizApp</b-navbar-brand>

      <!-- Hamburger Toggle for Mobile -->
      <b-navbar-toggle target="main-nav"></b-navbar-toggle>

      <!-- Collapsible Navigation Links -->
      <b-collapse id="main-nav" is-nav>
        <!-- Left-aligned Nav Items -->
        <b-navbar-nav>
          <b-nav-item to="/" exact>Home</b-nav-item>
          <b-nav-item to="/leaderboard">Leaderboard</b-nav-item>
        </b-navbar-nav>

        <!-- Right-aligned Nav Items -->
        <b-navbar-nav class="ml-auto">
          <!-- Show Login/Register if no user is logged in -->
          <template v-if="!currentUser">
            <b-nav-item to="/login">Login</b-nav-item>
            <b-nav-item to="/register">Register</b-nav-item>
          </template>
          
          <!-- Show User/Admin menus if a user is logged in -->
          <template v-else>
            <!-- Admin Dropdown (only shown if user is admin) -->
            <b-nav-item-dropdown v-if="isAdmin" text="Admin" right>
              <b-dropdown-item to="/admin/dashboard">Dashboard</b-dropdown-item>
              <b-dropdown-item to="/admin/quizzes">Manage Quizzes</b-dropdown-item>
              <b-dropdown-item to="/admin/users">Manage Users</b-dropdown-item>
            </b-nav-item-dropdown>
            
            <!-- User Profile Dropdown -->
            <b-nav-item-dropdown right>
              <!-- Custom Button Content for User Name -->
              <template #button-content>
                <span>{{ currentUser.displayName || 'User' }}</span>
              </template>
              <b-dropdown-item to="/profile">Profile</b-dropdown-item>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item @click="handleLogout">Logout</b-dropdown-item>
            </b-nav-item-dropdown>
          </template>
        </b-navbar-nav>
      </b-collapse>
    </b-container>
  </b-navbar>
</template>

<script>
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';

export default {
  name: 'AppNavbar',
  setup() {
    const router = useRouter();
    // Get user state, admin status, and logout function from the auth composable
    const { currentUser, isAdmin, logout } = useAuth();
    
    // Handles the logout process
    const handleLogout = async () => {
      try {
        await logout(); // Call the logout function from the composable
        router.push('/login'); // Redirect to login page after successful logout
      } catch (error) {
        console.error("Logout failed:", error); 
        // Optionally: Show an error message to the user
      }
    };
    
    // Expose state and methods to the template
    return {
      currentUser,
      isAdmin,
      handleLogout
    };
  }
};
</script>

<style scoped>
/* Add space below the fixed navbar so content isn't hidden */
/* Consider moving this style to App.vue or a global stylesheet 
   if you want consistent padding below the fixed navbar */
/* .navbar {
  margin-bottom: 20px; 
} */

/* Ensure dropdown menus align correctly */
.ml-auto .nav-item {
  margin-left: 0.5rem;
}
</style>