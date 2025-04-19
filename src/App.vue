<template>
  <div class="app-container">
    <AppNavbar />
    <main class="main-content">
      <router-view/>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppNavbar from '@/components/Common/AppNavbar.vue';
import AppFooter from '@/components/Common/AppFooter.vue';

export default {
  name: 'App',
  components: {
    AppNavbar,
    AppFooter
  }
};
</script>

<style>
@import './assets/styles/main.css';

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}
</style>
