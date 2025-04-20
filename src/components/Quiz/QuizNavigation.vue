<template>
  <div class="quiz-navigation">
    <!-- Navigation Buttons -->
    <div class="nav-row">
      <!-- Previous Button -->
      <button 
        class="btn btn-outline-secondary"
        :disabled="currentIndex === 0 || isSubmitting" 
        @click="$emit('previous')"
      >
        <i class="fas fa-chevron-left mr-1"></i> Précédent
      </button>
      
      <!-- Question Counter -->
      <div class="question-indicator">
        Question {{ currentIndex + 1 }} sur {{ totalQuestions }}
      </div>
      
      <!-- Next/Finish Button -->
      <button 
        v-if="currentIndex < totalQuestions - 1" 
        class="btn btn-outline-primary"
        :disabled="!isCurrentAnswered || isSubmitting" 
        @click="$emit('next')"
      >
        Suivant <i class="fas fa-chevron-right ml-1"></i>
      </button>
      <button 
        v-else 
        class="btn btn-success"
        :disabled="!isCurrentAnswered || isSubmitting || !canFinish" 
        @click="finishQuiz"
      >
        <span v-if="isSubmitting">
          <span class="spinner spinner-sm"></span> Envoi...
        </span>
        <span v-else>
          Terminer le quiz
        </span>
      </button>
    </div>
    
    <!-- Progress Bar -->
    <div class="progress-bar-outer">
      <div 
        class="progress-bar-inner" 
        :style="{ width: `${progressPercentage}%` }"
        :aria-valuenow="progressPercentage"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        {{ progressPercentage }}%
      </div>
    </div>
    
    <!-- Question Dots -->
    <div class="question-dots">
      <button 
        v-for="(answer, index) in userAnswers" 
        :key="index"
        class="question-dot"
        :class="{ 'answered': answer !== null, 'current': index === currentIndex }"
        @click="$emit('navigate', index)"
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
    const isSubmitting = ref(false);

    const isCurrentAnswered = computed(() => {
      if (!props.userAnswers?.[props.currentIndex]) return false;
      return props.userAnswers[props.currentIndex] !== null && 
             props.userAnswers[props.currentIndex] !== '';
    });

    const progressPercentage = computed(() => {
      if (!props.totalQuestions || !Array.isArray(props.userAnswers)) return 0;
      const answeredCount = props.userAnswers.filter(a => a !== null).length;
      return Math.round((answeredCount / props.totalQuestions) * 100);
    });

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
      finishQuiz
    };
  }
};
</script>

<style scoped>
.quiz-navigation {
  margin: 2rem 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  padding: 1.5rem;
}

.nav-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-outline-secondary {
  background: #fff;
  color: #6c757d;
  border: 1px solid #6c757d;
}
.btn-outline-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-outline-primary {
  background: #fff;
  color: #007bff;
  border: 1px solid #007bff;
}
.btn-outline-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-success {
  background: #28a745;
  color: #fff;
  border: 1px solid #28a745;
}
.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid #fff;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
}
.spinner-sm {
  width: 0.9em;
  height: 0.9em;
  border-width: 2px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.question-indicator {
  font-weight: bold;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.progress-bar-outer {
  width: 100%;
  background: #e9ecef;
  border-radius: 6px;
  height: 18px;
  margin-bottom: 1.2rem;
  overflow: hidden;
}
.progress-bar-inner {
  height: 100%;
  background: var(--primary-color, #007bff);
  color: #fff;
  font-weight: 500;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px 0 0 6px;
  transition: width 0.3s;
}

.question-dots {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 10px;
}

.question-dot {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #dee2e6;
  color: #495057;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.15s;
  outline: none;
}
.question-dot.answered {
  background: #28a745;
  color: #fff;
}
.question-dot.current {
  border: 2px solid var(--primary-color, #007bff);
  background: #fff;
  color: var(--primary-color, #007bff);
}
.question-dot:hover,
.question-dot:focus {
  transform: scale(1.1);
  background: var(--primary-color, #007bff);
  color: #fff;
}

@media (max-width: 600px) {
  .quiz-navigation {
    padding: 1rem;
  }
  .nav-row {
    flex-direction: column;
    gap: 0.7rem;
    align-items: stretch;
  }
}
</style>