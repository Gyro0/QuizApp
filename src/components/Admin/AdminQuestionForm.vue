<template>
  <div class="question-form">
    <b-form>
      <b-form-group label="Question Text" label-for="question-text">
        <b-form-textarea
          id="question-text"
          v-model="form.text"
          placeholder="Enter the question"
          required
          rows="3"
        ></b-form-textarea>
      </b-form-group>

      <b-form-group label="Options">
        <div v-for="(option, index) in form.options" :key="index" class="d-flex mb-2">
          <b-form-input
            v-model="form.options[index]"
            :placeholder="`Option ${index + 1}`"
            required
          ></b-form-input>
          
          <b-form-radio
            v-model="form.correctAnswerIndex"
            :value="index"
            class="ml-2 d-flex align-items-center"
          >
            Correct
          </b-form-radio>
          
          <b-button 
            v-if="form.options.length > 1"
            variant="outline-danger" 
            size="sm"
            class="ml-2"
            @click="removeOption(index)"
          >
            <i class="fas fa-times"></i>
          </b-button>
        </div>
        
        <b-button 
          variant="outline-secondary" 
          size="sm"
          class="mt-2"
          @click="addOption"
        >
          <i class="fas fa-plus mr-1"></i> Add Option
        </b-button>
      </b-form-group>
    </b-form>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  props: {
    question: {
      type: Object,
      default: () => ({ text: '', imageUrl: '', options: [''], correctAnswer: '' })
    }
  },
  emits: ['update:question'],
  setup(props, { emit }) {
    // Initialize form state based on props
    const initializeForm = (questionData) => {
      const options = Array.isArray(questionData?.options) ? [...questionData.options] : [''];
      const correctIndex = options.findIndex(opt => opt === questionData?.correctAnswer);
      return {
        text: questionData?.text || '',
        imageUrl: questionData?.imageUrl || '',
        options: options.length > 0 ? options : [''], // Ensure at least one option
        correctAnswerIndex: correctIndex >= 0 ? correctIndex : 0
      };
    };

    const form = ref(initializeForm(props.question));

    // Watch for external prop changes to update the local form state
    watch(() => props.question, (newQuestionData) => {
      form.value = initializeForm(newQuestionData);
    }, { deep: true });

    // Function to add a new empty option
    const addOption = () => {
      form.value.options.push('');
    };

    // Function to remove an option at a given index
    const removeOption = (index) => {
      // Prevent removing if only one option remains
      if (form.value.options.length <= 1) return;
      
      const currentCorrectIndex = form.value.correctAnswerIndex;

      // Remove the option directly using splice (Vue 3 handles reactivity)
      form.value.options.splice(index, 1);

      // Adjust the correct answer index based on the removed option's position
      if (currentCorrectIndex === index) {
        // If removed option was the correct one, reset index to 0
        form.value.correctAnswerIndex = 0;
      } else if (currentCorrectIndex > index) {
        // If removed option was before the correct one, decrement the index
        form.value.correctAnswerIndex--;
      }
      // If removed option was after the correct one, the index remains valid
    };

    return {
      form,
      addOption,
      removeOption
    };
  }
};
</script>