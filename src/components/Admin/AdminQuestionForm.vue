<template>
  <div class="question-form">
    <form @submit.prevent="$emit('update:question', form)">
      <div class="form-group">
        <label for="question-text">Question Text</label>
        <textarea
          id="question-text"
          v-model="form.text"
          class="input"
          placeholder="Enter the question"
          required
          rows="3"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Options</label>
        <div
          v-for="(option, index) in form.options"
          :key="index"
          class="option-row"
        >
          <input
            v-model="form.options[index]"
            :placeholder="`Option ${index + 1}`"
            class="input option-input"
            required
          />
          <input
            type="radio"
            :name="'correct-answer'"
            :value="index"
            v-model="form.correctAnswerIndex"
            class="radio"
            :id="`correct-${index}`"
          />
          <label :for="`correct-${index}`" class="radio-label">Correct</label>
          <button
            v-if="form.options.length > 1"
            type="button"
            class="btn btn-danger btn-sm"
            @click="removeOption(index)"
            title="Remove option"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <button
          type="button"
          class="btn btn-secondary btn-sm add-option-btn"
          @click="addOption"
        >
          <i class="fas fa-plus"></i> Add Option
        </button>
      </div>
    </form>
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
    const initializeForm = (questionData) => {
      const options = Array.isArray(questionData?.options) ? [...questionData.options] : [''];
      const correctIndex = options.findIndex(opt => opt === questionData?.correctAnswer);
      return {
        text: questionData?.text || '',
        imageUrl: questionData?.imageUrl || '',
        options: options.length > 0 ? options : [''],
        correctAnswerIndex: correctIndex >= 0 ? correctIndex : 0
      };
    };

    const form = ref(initializeForm(props.question));

    watch(() => props.question, (newQuestionData) => {
      form.value = initializeForm(newQuestionData);
    }, { deep: true });

    const addOption = () => {
      form.value.options.push('');
    };

    const removeOption = (index) => {
      if (form.value.options.length <= 1) return;
      const currentCorrectIndex = form.value.correctAnswerIndex;
      form.value.options.splice(index, 1);
      if (currentCorrectIndex === index) {
        form.value.correctAnswerIndex = 0;
      } else if (currentCorrectIndex > index) {
        form.value.correctAnswerIndex--;
      }
    };

    return {
      form,
      addOption,
      removeOption
    };
  }
};
</script>

<style scoped>
.question-form {
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
.option-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.option-input {
  flex: 1;
}
.radio {
  margin-left: 0.5rem;
}
.radio-label {
  margin-left: 0.25rem;
  font-size: 0.95rem;
}
.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-sm {
  padding: 0.3rem 0.7rem;
  font-size: 0.95rem;
}
.btn-danger {
  background: #dc3545;
  color: #fff;
}
.btn-secondary {
  background: #6c757d;
  color: #fff;
}
.add-option-btn {
  margin-top: 0.5rem;
}
</style>