<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="logo">
        <router-link to="/" class="nav-brand">
          <img src="@/assets/logo.png" alt="Logo" class="logo-img">
          <span>QuizApp</span>
        </router-link>
      </div>
      
      <div class="nav-links desktop-only">
        <router-link 
          v-for="item in navigationItems" 
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ active: $route.path === item.path }"
        >
          {{ item.name }}
        </router-link>
        
        <router-link 
          v-if="isAdmin"
          to="/admin/dashboard" 
          class="nav-link admin-link"
          :class="{ active: $route.path.startsWith('/admin') }"
        >
          Admin Dashboard
        </router-link>
      </div>
      
      <div class="auth-section desktop-only">
        <template v-if="currentUser">
          <div class="user-menu">
            <button 
              @click="isProfileMenuOpen = !isProfileMenuOpen"
              class="user-button"
            >
              <div class="user-avatar">
                {{ currentUser.email[0].toUpperCase() }}
              </div>
            </button>
            
            <div 
              v-show="isProfileMenuOpen"
              class="dropdown-menu"
              @click="isProfileMenuOpen = false"
            >
              <router-link 
                to="/profile" 
                class="dropdown-item"
              >
                Profil
              </router-link>
              
              <router-link 
                v-if="isAdmin"
                to="/admin/dashboard" 
                class="dropdown-item admin-item"
              >
                Admin Dashboard
              </router-link>
              
              <button 
                @click="logout"
                class="dropdown-item"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <router-link 
            to="/login" 
            class="btn btn-secondary"
          >
            Connexion
          </router-link>
          <router-link 
            to="/register" 
            class="btn btn-primary"
          >
            Inscription
          </router-link>
        </template>
      </div>
      
      <button 
        class="mobile-menu-button"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
        aria-label="Menu"
      >
        <span class="menu-icon"></span>
        <span class="menu-icon"></span>
        <span class="menu-icon"></span>
      </button>
    </div>
    
    <!-- Menu mobile -->
    <div 
      class="mobile-menu"
      :class="{ 'is-open': isMobileMenuOpen }"
      @click="isMobileMenuOpen = false"
    >
      <div class="mobile-menu-content" @click.stop>
        <router-link 
          v-for="item in navigationItems" 
          :key="item.path"
          :to="item.path"
          class="mobile-nav-link"
          :class="{ active: $route.path === item.path }"
        >
          {{ item.name }}
        </router-link>
        
        <router-link 
          v-if="isAdmin"
          to="/admin/dashboard" 
          class="mobile-nav-link admin-link"
          :class="{ active: $route.path.startsWith('/admin') }"
        >
          Admin Dashboard
        </router-link>
        
        <template v-if="currentUser">
          <router-link 
            to="/profile" 
            class="mobile-nav-link"
          >
            Profil
          </router-link>
          <button 
            @click="logout"
            class="mobile-nav-link"
          >
            Déconnexion
          </button>
        </template>
        <template v-else>
          <router-link 
            to="/login" 
            class="mobile-nav-link"
          >
            Connexion
          </router-link>
          <router-link 
            to="/register" 
            class="mobile-nav-link"
          >
            Inscription
          </router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth';

export default {
  name: 'AppNavbar',
  setup() {
    const { currentUser, logout, isAdmin } = useAuth();
    const isMobileMenuOpen = ref(false);
    const isProfileMenuOpen = ref(false);

    const navigationItems = [
      { name: 'Accueil', path: '/' },
      { name: 'Quiz', path: '/' },
      { name: 'Classement', path: '/leaderboard' },
    ];

    return {
      currentUser,
      logout,
      navigationItems,
      isMobileMenuOpen,
      isProfileMenuOpen,
      isAdmin,
    };
  },
};
</script>

<style scoped>
.navbar {
  background-color: var(--white);
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 50;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
}

.nav-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1.25rem;
}

.logo-img {
  height: 2rem;
  margin-right: 0.5rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--primary-color);
}

.auth-section {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.user-menu {
  position: relative;
}

.user-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background-color: var(--primary-color);
  color: var(--white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: var(--white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow);
  min-width: 12rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  z-index: 50;
}

.dropdown-item {
  display: block;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: background-color 0.2s ease;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  font: inherit;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: var(--secondary-color);
}

.mobile-menu-button {
  display: none;
  flex-direction: column;
  gap: 0.25rem;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
}

.menu-icon {
  display: block;
  width: 1.5rem;
  height: 2px;
  background-color: var(--text-primary);
  transition: transform 0.2s ease;
}

.mobile-menu {
  display: none;
  position: fixed;
  top: 4rem;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.mobile-menu.is-open {
  opacity: 1;
  visibility: visible;
}

.mobile-menu-content {
  background-color: var(--white);
  padding: 1rem;
  max-height: 100%;
  overflow-y: auto;
}

.mobile-nav-link {
  display: block;
  padding: 1rem;
  color: var(--text-primary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: background-color 0.2s ease;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  font: inherit;
  margin-bottom: 0.5rem;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  background-color: var(--secondary-color);
}

.admin-link {
  color: var(--primary-color) !important;
  font-weight: 700;
  position: relative;
}

.admin-link::after {
  content: '👑';
  font-size: 0.75rem;
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
}

.admin-item {
  color: var(--primary-color);
  font-weight: 600;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-menu-button {
    display: flex;
  }

  .mobile-menu {
    display: block;
  }
}
</style>