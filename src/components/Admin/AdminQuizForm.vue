<template>
  <div class="quiz-form">
    <!-- Display component-specific errors or errors from the composable -->
    <b-alert v-if="error" show variant="danger">{{ error }}</b-alert>

    <b-form @submit.prevent="handleSubmit">
      <b-form-group label="Quiz Title" label-for="quiz-title">
        <b-form-input
          id="quiz-title"
          v-model="form.title"
          placeholder="Enter quiz title"
          required
        ></b-form-input>
      </b-form-group>

      <b-form-group label="Description" label-for="quiz-description">
        <b-form-textarea
          id="quiz-description"
          v-model="form.description"
          placeholder="Enter quiz description"
          rows="3"
        ></b-form-textarea>
      </b-form-group>

      <b-form-group label="Category" label-for="quiz-category">
        <b-form-input
          id="quiz-category"
          v-model="form.category"
          placeholder="Enter quiz category"
        ></b-form-input>
      </b-form-group>

      <b-form-group>
        <b-form-checkbox v-model="form.isPublished">
          Publish Quiz
        </b-form-checkbox>
      </b-form-group>

      <b-form-group>
        <b-form-checkbox v-model="form.showFeedback">
          Show Feedback After Each Question
        </b-form-checkbox>
      </b-form-group>

      <div class="d-flex justify-content-between">
        <b-button type="button" variant="outline-secondary" @click="$emit('cancel')">
          Cancel
        </b-button>
        <b-button type="submit" variant="primary" :disabled="isLoading">
          <b-spinner v-if="isLoading" small class="mr-1"></b-spinner>
          <!-- Use computed property for button text -->
          {{ isEditing ? 'Update' : 'Create' }} Quiz
        </b-button>
      </div>
    </b-form>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { useQuiz } from '@/composables/useQuiz';

export default {
  name: 'AdminQuizForm',
  props: {
    quizId: {
      type: String,
      default: null
    }
  },
  emits: ['cancel', 'saved'],
  setup(props, { emit }) {
    // Use reactive for the form object
    const form = reactive({
      title: '',
      description: '',
      category: '',
      isPublished: false,
      showFeedback: true // Default to true
    });

    const { createQuiz, updateQuiz, fetchQuiz, error: quizComposableError, isLoading } = useQuiz();
    const componentError = ref(null); // Local error state for this component
    const isEditing = computed(() => !!props.quizId); // Check if editing based on quizId prop

    // Fetches quiz data if editing an existing quiz
    const loadQuizForEdit = async () => {
      if (!isEditing.value) return; // Exit if not editing

      try {
        const quizData = await fetchQuiz(props.quizId);
        if (quizData) {
          // Populate the reactive form with fetched data
          form.title = quizData.title || '';
          form.description = quizData.description || '';
          form.category = quizData.category || '';
          form.isPublished = quizData.isPublished || false;
          // Ensure showFeedback defaults to true if undefined
          form.showFeedback = quizData.showFeedback !== undefined ? quizData.showFeedback : true;
        } else {
          componentError.value = 'Quiz not found';
        }
      } catch (err) {
        console.error('Error loading quiz for editing:', err);
        componentError.value = err.message || 'Failed to load quiz data.';
      }
    };

    // Handles form submission for creating or updating a quiz
    const handleSubmit = async () => {
      componentError.value = null; // Reset local error

      try {
        const payload = { ...form }; // Get current form data
        let result;

        if (isEditing.value) {
          result = await updateQuiz(props.quizId, payload);
        } else {
          result = await createQuiz(payload);
        }

        if (result) {
          emit('saved', result); // Emit success event with result
        } else {
          // Use error from composable or a generic message
          componentError.value = quizComposableError.value || 'Failed to save quiz.';
        }
      } catch (err) {
        console.error('Error during quiz save operation:', err);
        componentError.value = err.message || 'An unexpected error occurred while saving.';
      }
    };

    // Load quiz data when component mounts if in edit mode
    onMounted(loadQuizForEdit);

    return {
      form,
      error: componentError, // Expose local error state to template
      isLoading,
      handleSubmit,
      isEditing // Expose editing status for template logic
    };
  }
};
</script>