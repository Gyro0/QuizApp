<template>
  <div class="auth-card">
    <h2 class="auth-title">Register</h2>
    <form class="auth-form" @submit.prevent="handleRegister">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div class="form-group">
        <label for="display-name">Display Name</label>
        <input
          id="display-name"
          v-model="form.displayName"
          class="input"
          placeholder="Enter your display name"
          required
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="input"
          placeholder="Enter your email"
          required
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="input"
          placeholder="Enter your password (min. 6 characters)"
          required
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="confirm-password">Confirm Password</label>
        <input
          id="confirm-password"
          v-model="form.confirmPassword"
          type="password"
          class="input"
          placeholder="Confirm your password"
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
        Register
      </button>
    </form>
    <div class="auth-link">
      <p>Already have an account? <router-link to="/login">Login</router-link></p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { db } from '@/firebase/firebaseInit';

export default {
  name: 'RegisterForm',
  setup() {
    const router = useRouter();
    const { register, error: authError, isLoading } = useAuth();

    const form = ref({
      displayName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    const error = ref('');

    const handleRegister = async () => {
      error.value = '';
      const { displayName, email, password, confirmPassword } = form.value;

      if (!displayName || !email || !password) {
        error.value = 'All fields are required.';
        return;
      }
      if (password !== confirmPassword) {
        error.value = 'Passwords do not match.';
        return;
      }
      if (password.length < 6) {
        error.value = 'Password must be at least 6 characters long.';
        return;
      }

      try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).get();
        if (!snapshot.empty) {
          error.value = 'An account with this email already exists.';
          return;
        }
        const success = await register(email, password, displayName);
        if (success) {
          router.push('/');
        } else {
          error.value = authError.value || 'Registration failed. Please try again.';
        }
      } catch (err) {
        error.value = err.message || 'An unexpected error occurred during registration.';
      }
    };

    return {
      form,
      isLoading,
      error,
      handleRegister
    };
  }
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
  margin-bottom: 1rem;
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
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 0.5em;
  vertical-align: middle;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>