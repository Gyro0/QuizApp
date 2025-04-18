<template>
  <div id="app">
    <AppNavbar />
    <div class="content">
      <router-view/>
    </div>
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  padding-top: 70px; /* Adjust for fixed navbar */
  padding-bottom: 30px;
  flex: 1;
}
</style>
