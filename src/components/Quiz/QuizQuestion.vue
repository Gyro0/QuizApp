<template>
  <div class="quiz-question">
    <div v-if="question">
      <h3 class="mb-4">{{ question.text }}</h3>
      
      <b-img v-if="question.imageUrl" :src="question.imageUrl" fluid alt="Question image" class="text-center mb-4"></b-img>
      
      <b-form-group>
        <b-form-radio-group
          v-model="localAnswer"
          :options="formattedOptions"
          stacked
          name="question-options"
        ></b-form-radio-group>
      </b-form-group>
      
      <b-alert v-if="feedback && showFeedback" :variant="isCorrect ? 'success' : 'danger'" show>
        {{ feedback }}
      </b-alert>
    </div>
    
    <div v-else class="text-center my-5">
      <p>No question available.</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'QuizQuestion',
  props: {
    question: { type: Object, required: true },
    userAnswer: { type: String, default: null },
    questionIndex: { type: Number, required: true },
    showFeedback: { type: Boolean, default: false },
    showAnswers: { type: Boolean, default: false }
  },
  emits: ['answer-selected'],
  setup(props, { emit }) {
    // Initialize with props or default
    const localAnswer = ref(props.userAnswer || null);
    const feedback = ref('');
    const isCorrect = ref(false);
    
    // Format options for radio group
    const formattedOptions = computed(() => {
      if (!props.question?.options) return [];
      return props.question.options.map(option => ({ text: option, value: option }));
    });
    
    // Watch for user selection changes
    watch(localAnswer, (newValue) => {
      if (newValue) {
        console.log('Answer selected:', newValue);
        emit('answer-selected', newValue);
        
        // Check if answer is correct (for feedback)
        isCorrect.value = newValue === props.question.correctAnswer;
        feedback.value = isCorrect.value 
          ? 'Correct! Well done.' 
          : `Incorrect. The correct answer is: ${props.question.correctAnswer}`;
      }
    });
    
    // Sync with parent component
    watch(() => props.userAnswer, (newValue) => {
      if (newValue !== localAnswer.value) {
        localAnswer.value = newValue;
      }
    });
    
    // Reset when question changes
    watch(() => props.question, () => {
      localAnswer.value = props.userAnswer;
      feedback.value = '';
    });
    
    return { localAnswer, formattedOptions, feedback, isCorrect };
  }
};
</script>

<style scoped>
.quiz-question {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.b-form-radio-group {
  margin-bottom: 15px;
}

.b-form-radio {
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.b-form-radio:hover {
  background-color: #e9ecef;
}
</style>