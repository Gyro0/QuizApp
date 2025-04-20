<template>
  <div class="quiz-form">
    <form @submit.prevent="handleSubmit">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div class="form-group">
        <label for="quiz-title">Quiz Title</label>
        <input
          id="quiz-title"
          v-model="form.title"
          class="input"
          placeholder="Enter quiz title"
          required
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="quiz-description">Description</label>
        <textarea
          id="quiz-description"
          v-model="form.description"
          class="input"
          placeholder="Enter a short description"
          rows="3"
          :disabled="isLoading"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="quiz-category">Category</label>
        <input
          id="quiz-category"
          v-model="form.category"
          class="input"
          placeholder="Enter category"
          required
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="quiz-image">Image URL (optional)</label>
        <input
          id="quiz-image"
          v-model="form.imageUrl"
          class="input"
          placeholder="Paste an image URL"
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="quiz-time-limit">Time Limit (minutes)</label>
        <input
          id="quiz-time-limit"
          v-model.number="form.timeLimit"
          class="input"
          type="number"
          min="1"
          max="120"
          placeholder="Enter time limit in minutes"
          required
          :disabled="isLoading"
        />
        <small class="helper-text">Default: 10 minutes</small>
      </div>

      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner"></span>
          {{ isEdit ? 'Update Quiz' : 'Create Quiz' }}
        </button>
        <button
          v-if="showCancel"
          type="button"
          class="btn btn-secondary"
          @click="$emit('cancel')"
          :disabled="isLoading"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue';

export default {
  name: 'AdminQuizForm',
  props: {
    quiz: {
      type: Object,
      default: () => ({})
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    showCancel: {
      type: Boolean,
      default: true
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const form = ref({
      title: '',
      description: '',
      category: '',
      imageUrl: '',
      timeLimit: 10 // Default to 10 minutes
    });
    const error = ref('');

    watch(
      () => props.quiz,
      (newQuiz) => {
        form.value = {
          title: newQuiz.title || '',
          description: newQuiz.description || '',
          category: newQuiz.category || '',
          imageUrl: newQuiz.imageUrl || '',
          timeLimit: newQuiz.timeLimit || 10 // Default if not present
        };
      },
      { immediate: true, deep: true }
    );

    const isEdit = computed(() => !!props.quiz && !!props.quiz.id);

    const handleSubmit = () => {
      error.value = '';
      if (!form.value.title || !form.value.category) {
        error.value = 'Title and category are required.';
        return;
      }
      
      // Ensure timeLimit is a number
      form.value.timeLimit = parseInt(form.value.timeLimit) || 10;
      
      emit('submit', { ...form.value });
    };

    return {
      form,
      error,
      isEdit,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.quiz-form {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}
.form-group {
  margin-bottom: 1.5rem;
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
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}
.btn {
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary {
  background: var(--primary-color, #007bff);
  color: #fff;
}
.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn-secondary {
  background: #6c757d;
  color: #fff;
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
.helper-text {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.25rem;
}
</style>