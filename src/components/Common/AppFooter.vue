<template>
  <footer class="footer mt-auto py-3 bg-light">
    <div class="container text-center">
      <span class="text-muted">© {{ currentYear }} QuizApp. All rights reserved.</span>
    </div>
  </footer>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'AppFooter',
  setup() {
    const currentYear = computed(() => new Date().getFullYear());
    
    return {
      currentYear
    };
  }
};
</script>

<style scoped>
.footer {
  margin-top: auto;
  padding: 1rem 0;
}
</style>