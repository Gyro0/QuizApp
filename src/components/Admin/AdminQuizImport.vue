<template>
  <div class="quiz-import">
    <div class="quiz-import-card">
      <h2 class="quiz-import-title">Import Quiz from Open Trivia Database</h2>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <form @submit.prevent="handleImport">
        <div class="form-group">
          <label for="quiz-title">Quiz Title</label>
          <input
            id="quiz-title"
            v-model="importForm.title"
            class="input"
            placeholder="Enter quiz title (optional, defaults based on category/difficulty)"
            :disabled="isLoading"
          />
        </div>
        <div class="form-group">
          <label for="quiz-description">Description</label>
          <textarea
            id="quiz-description"
            v-model="importForm.description"
            class="input"
            placeholder="Enter quiz description (optional)"
            rows="3"
            :disabled="isLoading"
          ></textarea>
        </div>
        <div class="form-group">
          <label for="quiz-category">Category</label>
          <select
            id="quiz-category"
            v-model="importForm.category"
            class="input"
            :disabled="isLoading"
          >
            <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="quiz-difficulty">Difficulty</label>
          <select
            id="quiz-difficulty"
            v-model="importForm.difficulty"
            class="input"
            :disabled="isLoading"
          >
            <option v-for="opt in difficultyOptions" :key="opt.value" :value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="quiz-amount">Number of Questions</label>
          <input
            id="quiz-amount"
            v-model.number="importForm.amount"
            type="number"
            min="1"
            max="50"
            class="input"
            required
            :disabled="isLoading"
          />
        </div>
        <div class="form-actions">
          <button
            type="button"
            class="btn btn-secondary"
            @click="$emit('cancel')"
            :disabled="isLoading"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner"></span>
            Import Quiz
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useExternalQuiz } from '@/composables/useExternalQuiz';

export default {
  name: 'AdminQuizImport',
  emits: ['cancel', 'imported'],
  setup(props, { emit }) {
    const router = useRouter();
    const {
      importFromOpenTriviaDB,
      getCategories,
      isLoading,
      error
    } = useExternalQuiz();

    const importForm = ref({
      title: '',
      description: '',
      category: '',
      difficulty: '',
      amount: 10
    });

    const categories = ref([]);

    const categoryOptions = computed(() => {
      const options = [{ value: '', text: 'Any Category' }];
      categories.value.forEach(category => {
        options.push({
          value: category.id,
          text: category.name
        });
      });
      return options;
    });

    const difficultyOptions = [
      { value: '', text: 'Any Difficulty' },
      { value: 'easy', text: 'Easy' },
      { value: 'medium', text: 'Medium' },
      { value: 'hard', text: 'Hard' }
    ];

    const loadCategories = async () => {
      try {
        const fetchedCategories = await getCategories();
        categories.value = fetchedCategories || [];
      } catch (err) {
        // Error handled by composable
      }
    };

    const handleImport = async () => {
      try {
        let categoryName = 'General Knowledge';
        if (importForm.value.category) {
          const foundCategory = categories.value.find(c => c.id == importForm.value.category);
          if (foundCategory) categoryName = foundCategory.name;
        }
        let difficultyName = '';
        if (importForm.value.difficulty) {
          difficultyName = importForm.value.difficulty.charAt(0).toUpperCase() +
            importForm.value.difficulty.slice(1);
        }
        const defaultTitle = `${difficultyName} ${categoryName} Quiz`.trim();
        const result = await importFromOpenTriviaDB(
          importForm.value.amount,
          importForm.value.category,
          importForm.value.difficulty,
          importForm.value.title || defaultTitle,
          importForm.value.description
        );
        if (result) {
          emit('imported', result);
          router.push('/admin/quizzes');
        }
      } catch (err) {
        // Error handled by composable
      }
    };

    onMounted(loadCategories);

    return {
      importForm,
      categoryOptions,
      difficultyOptions,
      isLoading,
      error,
      handleImport
    };
  }
};
</script>

<style scoped>
.quiz-import {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 0;
}
.quiz-import-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  padding: 2rem;
}
.quiz-import-title {
  text-align: center;
  margin-bottom: 1.5rem;
}
.form-group {
  margin-bottom: 1.25rem;
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
  justify-content: flex-end;
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
</style>