<template>
  <div class="auth-page">
    <div class="container">
        <LoginForm />
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import LoginForm from '@/components/Auth/LoginForm.vue';

export default {
  name: 'LoginView',
  components: { LoginForm },
  setup() {
    const { currentUser } = useAuth();
    const router = useRouter();

    onMounted(() => {
      if (currentUser.value) {
        router.push('/');
      }
    });
  }
};
</script>

<style scoped>
.auth-page {
    min-height: calc(100vh - 160px); /* Ajustez en fonction de la hauteur de votre navbar + footer */
    display: flex;
    align-items: center;
    padding: 2rem 0;
}

.auth-container {
    max-width: 480px;
    margin: 0 auto;
    padding: 2rem;
    background-color: var(--white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
}

.auth-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--text-primary);
    text-align: center;
    margin-bottom: 2rem;
}

@media (max-width: 768px) {
    .auth-page {
        padding: 1rem;
    }

    .auth-container {
        padding: 1.5rem;
    }
}
</style>