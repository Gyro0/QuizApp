<template>
  <div class="auth-card">
    <h2 class="auth-title">Connexion</h2>
    <form class="auth-form" @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          v-model="email"
          class="input"
          placeholder="Entrez votre email"
          required
          :disabled="isLoading"
        />
      </div>
      <div class="form-group">
        <label for="login-password">Mot de passe</label>
        <input
          id="login-password"
          type="password"
          v-model="password"
          class="input"
          placeholder="Entrez votre mot de passe"
          required
          :disabled="isLoading"
        />
      </div>
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="spinner"></span>
        Se connecter
      </button>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
    </form>
    <div class="auth-link">
      <p>Pas encore de compte ?
        <router-link to="/register">Créer un compte</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';
import { useFirestore } from '@/composables/useFirestore';

export default {
  name: 'LoginForm',
  setup() {
    const email = ref('');
    const password = ref('');
    const error = ref(null);
    const router = useRouter();
    const { login, error: authError, isLoading } = useAuth();

    watch(authError, (newVal) => {
      error.value = newVal;
    });

    const handleLogin = async () => {
      error.value = null;
      const res = await login(email.value, password.value);

      if (res && res.user) {
        const user = res.user;
        const { getUserData } = useFirestore();
        const userData = await getUserData(user.uid);

        if (userData && userData.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        error.value = 'Email ou mot de passe invalide.';
      }
    };

    return {
      email,
      password,
      error,
      handleLogin,
      isLoading,
    };
  },
};
</script>

<style scoped>
.auth-card {
  max-width: 400px;
  margin: 40px auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
}
.auth-title {
  text-align: center;
  margin-bottom: 1.5rem;
}
.auth-form .form-group {
  margin-bottom: 1rem;
}
.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 1rem;
  background: #fafbfc;
  transition: border 0.2s;
}
.input:focus {
  border-color: var(--primary-color, #007bff);
  outline: none;
}
.btn {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 4px;
  border: none;
  margin-top: 1rem;
  background: var(--primary-color, #007bff);
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.alert {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.95rem;
}
.alert-danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
.auth-link {
  margin-top: 1.5rem;
  text-align: center;
}
.spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid #fff;
  border-top: 2px solid var(--primary-color, #007bff);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 0.5em;
  vertical-align: middle;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>