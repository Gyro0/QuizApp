<template>
  <div class="register-form">
    <!-- Display validation or registration errors -->
    <b-alert v-if="error" show variant="danger">{{ error }}</b-alert>
    
    <b-form @submit.prevent="handleRegister">
      <!-- Display Name Input -->
      <b-form-group label="Display Name" label-for="display-name">
        <b-form-input
          id="display-name"
          v-model="form.displayName"
          placeholder="Enter your display name"
          required
          :disabled="isLoading"
        ></b-form-input>
      </b-form-group>
      
      <!-- Email Input -->
      <b-form-group label="Email" label-for="email">
        <b-form-input
          id="email"
          v-model="form.email"
          type="email"
          placeholder="Enter your email"
          required
          :disabled="isLoading"
        ></b-form-input>
      </b-form-group>
      
      <!-- Password Input -->
      <b-form-group label="Password" label-for="password">
        <b-form-input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="Enter your password (min. 6 characters)"
          required
          :disabled="isLoading"
        ></b-form-input>
      </b-form-group>
      
      <!-- Confirm Password Input -->
      <b-form-group label="Confirm Password" label-for="confirm-password">
        <b-form-input
          id="confirm-password"
          v-model="form.confirmPassword"
          type="password"
          placeholder="Confirm your password"
          required
          :disabled="isLoading"
        ></b-form-input>
      </b-form-group>
      
      <!-- Submit Button -->
      <b-button type="submit" variant="primary" :disabled="isLoading" block>
        <b-spinner v-if="isLoading" small class="mr-1"></b-spinner>
        Register
      </b-button>
    </b-form>
    
    <!-- Link to Login Page -->
    <div class="mt-3 text-center">
      <p>Already have an account? <router-link to="/login">Login</router-link></p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
// Import db directly for the Firestore query
import { db } from '@/firebase/firebaseInit'; 

export default {
  name: 'RegisterForm',
  setup() {
    const router = useRouter();
    // Destructure necessary functions and state from useAuth
    const { register, error: authError, isLoading } = useAuth();
    
    // Reactive form state
    const form = ref({
      displayName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    
    // Local error state for validation or registration feedback
    const error = ref('');
    
    // Function to handle the registration process
    const handleRegister = async () => {
      error.value = ''; // Reset error message on new attempt
      
      // --- Client-Side Validation ---
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
      
      // --- Registration Logic ---
      try {
        // 1. Check if email already exists in the 'users' collection
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).get();
        
        if (!snapshot.empty) {
          error.value = 'An account with this email already exists.';
          return; // Stop registration if email is taken
        }
        
        // 2. Attempt to register the user via the useAuth composable
        const success = await register(email, password, displayName);
        
        // 3. Handle registration result
        if (success) {
          router.push('/'); // Redirect to home page on successful registration
        } else {
          // If registration failed, use the error from the auth composable
          error.value = authError.value || 'Registration failed. Please try again.';
        }
        
      } catch (err) {
        // Catch any unexpected errors during the process
        console.error('Registration process error:', err);
        error.value = err.message || 'An unexpected error occurred during registration.';
      }
    };
    
    // Expose reactive state and methods to the template
    return {
      form,
      isLoading, // Loading state from useAuth
      error,     // Local error message state
      handleRegister
    };
  }
};
</script>