<template>
  <div class="quiz-question">
    <div v-if="question">
      <h3 class="question-title">{{ question.text }}</h3>
      
      <div v-if="question.imageUrl" class="question-image">
        <img :src="question.imageUrl" alt="Question image" />
      </div>
      
      <div class="options-list">
        <button
          v-for="option in question.options"
          :key="option"
          class="option-btn"
          :class="{
            selected: localAnswer === option,
            correct: showAnswers && option === question.correctAnswer,
            incorrect: showAnswers && localAnswer === option && option !== question.correctAnswer
          }"
          :disabled="showAnswers"
          @click="selectOption(option)"
        >
          {{ option }}
        </button>
      </div>
      
      <div v-if="feedback && showFeedback" class="feedback" :class="isCorrect ? 'feedback-success' : 'feedback-danger'">
        {{ feedback }}
      </div>
    </div>
    
    <div v-else class="empty-state">
      <p>Aucune question disponible.</p>
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
    const localAnswer = ref(props.userAnswer || null);
    const feedback = ref('');
    const isCorrect = ref(false);

    const selectOption = (option) => {
      if (props.showAnswers) return;
      localAnswer.value = option;
    };

    watch(localAnswer, (newValue) => {
      if (newValue) {
        emit('answer-selected', newValue);
        isCorrect.value = newValue === props.question.correctAnswer;
        feedback.value = isCorrect.value
          ? 'Bonne réponse !'
          : `Incorrect. La bonne réponse est : ${props.question.correctAnswer}`;
      }
    });

    watch(() => props.userAnswer, (newValue) => {
      if (newValue !== localAnswer.value) {
        localAnswer.value = newValue;
      }
    });

    watch(() => props.question, () => {
      localAnswer.value = props.userAnswer;
      feedback.value = '';
    });

    return { localAnswer, feedback, isCorrect, selectOption };
  }
};
</script>

<style scoped>
.quiz-question {
  padding: 2rem;
  background-color: #fff;
  border-radius: 1rem;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  margin-bottom: 2rem;
}

.question-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.question-image {
  text-align: center;
  margin-bottom: 1.5rem;
}
.question-image img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.option-btn {
  width: 100%;
  text-align: left;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1.5px solid #dee2e6;
  background: #f8f9fa;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s, border 0.18s, color 0.18s;
  outline: none;
}
.option-btn.selected {
  background: var(--primary-color, #007bff);
  color: #fff;
  border-color: var(--primary-color, #007bff);
}
.option-btn.correct {
  background: #d4edda;
  color: #155724;
  border-color: #28a745;
}
.option-btn.incorrect {
  background: #f8d7da;
  color: #721c24;
  border-color: #dc3545;
}
.option-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.option-btn:focus {
  box-shadow: 0 0 0 2px var(--primary-color, #007bff);
}

.feedback {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  text-align: center;
  font-weight: 500;
}
.feedback-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #28a745;
}
.feedback-danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #dc3545;
}

.empty-state {
  text-align: center;
  color: #6c757d;
  padding: 2rem 0;
}
</style>