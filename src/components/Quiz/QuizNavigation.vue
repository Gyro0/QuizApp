<template>
  <div class="quiz-navigation">
    <!-- Navigation Buttons -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <!-- Previous Button -->
      <b-button 
        variant="outline-secondary" 
        :disabled="currentIndex === 0 || isSubmitting" 
        @click="emit('previous')"
      >
        <i class="fas fa-chevron-left mr-1"></i> Previous
      </b-button>
      
      <!-- Question Counter -->
      <div class="question-indicator">
        Question {{ currentIndex + 1 }} of {{ totalQuestions }}
      </div>
      
      <!-- Next/Finish Button -->
      <b-button 
        v-if="currentIndex < totalQuestions - 1" 
        variant="outline-primary" 
        :disabled="!isCurrentAnswered || isSubmitting" 
        @click="emit('next')"
      >
        Next <i class="fas fa-chevron-right ml-1"></i>
      </b-button>
      
      <b-button 
        v-else 
        variant="success" 
        :disabled="!isCurrentAnswered || isSubmitting || !canFinish" 
        @click="finishQuiz"
      >
        <span v-if="isSubmitting">
          <b-spinner small></b-spinner> Submitting...
        </span>
        <span v-else>
          Finish Quiz
        </span>
      </b-button>
    </div>
    
    <!-- Progress Bar -->
    <div class="progress mb-3">
      <div 
        class="progress-bar" 
        role="progressbar"
        :style="{ width: `${progressPercentage}%` }"
        :aria-valuenow="progressPercentage"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        {{ progressPercentage }}%
      </div>
    </div>
    
    <!-- Question Dots -->
    <div class="question-dots d-flex justify-content-center flex-wrap">
      <button 
        v-for="(answer, index) in userAnswers" 
        :key="index"
        class="question-dot"
        :class="{ 'answered': answer !== null, 'current': index === currentIndex }"
        @click="emit('navigate', index)"
      >
        {{ index + 1 }}
      </button>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';

export default {
  name: 'QuizNavigation',
  props: {
    currentIndex: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    userAnswers: { type: Array, default: () => [] },
    canFinish: { type: Boolean, default: false }
  },
  emits: ['previous', 'next', 'navigate', 'finish'],
  setup(props, { emit }) {
    // State
    const isSubmitting = ref(false);
    
    // Check if current question has an answer
    const isCurrentAnswered = computed(() => {
      if (!props.userAnswers?.[props.currentIndex]) return false;
      return props.userAnswers[props.currentIndex] !== null && 
             props.userAnswers[props.currentIndex] !== '';
    });
    
    // Calculate progress percentage
    const progressPercentage = computed(() => {
      if (!props.totalQuestions || !Array.isArray(props.userAnswers)) return 0;
      const answeredCount = props.userAnswers.filter(a => a !== null).length;
      return Math.round((answeredCount / props.totalQuestions) * 100);
    });
    
    // Handle finish button with loading state
    const finishQuiz = async () => {
      isSubmitting.value = true;
      try {
        await emit('finish');
      } finally {
        isSubmitting.value = false;
      }
    };
    
    return {
      isCurrentAnswered,
      progressPercentage,
      isSubmitting,
      finishQuiz,
      emit // Expose emit to use directly in template
    };
  }
};
</script>

<style scoped>
.quiz-navigation { margin: 20px 0; }
.question-indicator { font-weight: bold; }
.question-dots { margin-top: 15px; }

.question-dot {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background-color: #dee2e6;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.question-dot.answered {
  background-color: #28a745;
  color: white;
}

.question-dot.current {
  border: 2px solid #007bff;
}

.question-dot:hover {
  transform: scale(1.1);
}
</style>