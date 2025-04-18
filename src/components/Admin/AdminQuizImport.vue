<template>
  <div class="quiz-import">
    <b-card title="Import Quiz from Open Trivia Database">
      <!-- Display error from the composable -->
      <b-alert v-if="error" show variant="danger">{{ error }}</b-alert>

      <b-form @submit.prevent="handleImport">
        <!-- Quiz Title -->
        <b-form-group label="Quiz Title" label-for="quiz-title">
          <b-form-input
            id="quiz-title"
            v-model="importForm.title"
            placeholder="Enter quiz title (optional, defaults based on category/difficulty)"
            required
          ></b-form-input>
        </b-form-group>

        <!-- Description -->
        <b-form-group label="Description" label-for="quiz-description">
          <b-form-textarea
            id="quiz-description"
            v-model="importForm.description"
            placeholder="Enter quiz description (optional)"
            rows="3"
          ></b-form-textarea>
        </b-form-group>

        <!-- Category -->
        <b-form-group label="Category" label-for="quiz-category">
          <b-form-select
            id="quiz-category"
            v-model="importForm.category"
            :options="categoryOptions"
          ></b-form-select>
        </b-form-group>

        <!-- Difficulty -->
        <b-form-group label="Difficulty" label-for="quiz-difficulty">
          <b-form-select
            id="quiz-difficulty"
            v-model="importForm.difficulty"
            :options="difficultyOptions"
          ></b-form-select>
        </b-form-group>

        <!-- Number of Questions -->
        <b-form-group label="Number of Questions" label-for="quiz-amount">
          <b-form-input
            id="quiz-amount"
            v-model.number="importForm.amount"
            type="number"
            min="1"
            max="50"
            required
          ></b-form-input>
        </b-form-group>

        <!-- Action Buttons -->
        <div class="d-flex justify-content-between">
          <b-button type="button" variant="outline-secondary" @click="$emit('cancel')">
            Cancel
          </b-button>
          <b-button type="submit" variant="primary" :disabled="isLoading">
            <b-spinner v-if="isLoading" small class="mr-1"></b-spinner>
            Import Quiz
          </b-button>
        </div>
      </b-form>
    </b-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useExternalQuiz } from '@/composables/useExternalQuiz'; // Ensure correct path

export default {
  name: 'AdminQuizImport',
  emits: ['cancel', 'imported'],
  setup(props, { emit }) {
    const router = useRouter();
    // Destructure necessary functions and state from the composable
    const { 
      importFromOpenTriviaDB, 
      getCategories, 
      isLoading, 
      error 
    } = useExternalQuiz();
    
    // Form state using ref
    const importForm = ref({
      title: '',
      description: '',
      category: '', // Corresponds to category ID from API
      difficulty: '', // 'easy', 'medium', 'hard' or ''
      amount: 10 // Default number of questions
    });
    
    // State for storing fetched categories
    const categories = ref([]);
    
    // Computed property to format categories for the dropdown select
    const categoryOptions = computed(() => {
      // Start with an option for 'Any Category'
      const options = [{ value: '', text: 'Any Category' }];
      // Map fetched categories to the required format
      categories.value.forEach(category => {
        options.push({
          value: category.id, // Use category ID as the value
          text: category.name // Use category name as the display text
        });
      });
      return options;
    });
    
    // Static options for the difficulty dropdown select
    const difficultyOptions = [
      { value: '', text: 'Any Difficulty' },
      { value: 'easy', text: 'Easy' },
      { value: 'medium', text: 'Medium' },
      { value: 'hard', text: 'Hard' }
    ];
    
    // Function to fetch categories from the API
    const loadCategories = async () => {
      try {
        const fetchedCategories = await getCategories();
        categories.value = fetchedCategories || []; // Ensure it's an array
      } catch (err) {
        console.error("Failed to load categories:", err);
        // Error is already handled by the composable and shown in the template
      }
    };
    
    // Function to handle the form submission
    const handleImport = async () => {
      try {
        // Determine category name for default title generation
        let categoryName = 'General Knowledge'; // Default if no category selected
        if (importForm.value.category) {
          const foundCategory = categories.value.find(c => c.id == importForm.value.category);
          if (foundCategory) categoryName = foundCategory.name;
        }
        
        // Format difficulty name for default title generation
        let difficultyName = '';
        if (importForm.value.difficulty) {
          // Capitalize the first letter
          difficultyName = importForm.value.difficulty.charAt(0).toUpperCase() + 
                           importForm.value.difficulty.slice(1);
        }
        
        // Construct the default title if none provided
        const defaultTitle = `${difficultyName} ${categoryName} Quiz`.trim();
        
        // Call the import function from the composable
        const result = await importFromOpenTriviaDB(
          importForm.value.amount,
          importForm.value.category,
          importForm.value.difficulty,
          importForm.value.title || defaultTitle, // Use provided title or default
          importForm.value.description
        );
        
        // If import was successful
        if (result) {
          emit('imported', result); // Emit event with the new quiz data
          router.push('/admin/quizzes'); // Navigate to the quiz management page
        }
        // If result is null/false, the error state in the composable should be set
        
      } catch (err) {
        // Catch unexpected errors during the handleImport process itself
        console.error('Error during quiz import process:', err);
        // The composable should ideally handle and expose API errors
      }
    };
    
    // Fetch categories when the component is mounted
    onMounted(loadCategories);
    
    // Expose necessary state and functions to the template
    return {
      importForm,
      categoryOptions,
      difficultyOptions,
      isLoading, // Loading state from the composable
      error,     // Error state from the composable
      handleImport
    };
  }
};
</script>