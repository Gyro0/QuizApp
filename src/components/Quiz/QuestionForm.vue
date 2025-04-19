<template>
  <div class="question-form">
    <h3>{{ isEditing ? 'Modifier la question' : 'Ajouter une question' }}</h3>
    
    <form @submit.prevent="handleSubmit" class="form-container">
      <div class="form-group">
        <label for="question">Question</label>
        <textarea
          id="question"
          v-model="form.question"
          class="input"
          required
          placeholder="Entrez votre question"
          rows="2"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Type de réponse</label>
        <div class="radio-group">
          <label class="radio-label">
            <input
              type="radio"
              v-model="form.type"
              value="single"
              required
            >
            <span>Choix unique</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              v-model="form.type"
              value="multiple"
              required
            >
            <span>Choix multiples</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>Options de réponse</label>
        <div class="options-list">
          <div
            v-for="(option, index) in form.options"
            :key="index"
            class="option-item"
          >
            <input
              type="text"
              v-model="form.options[index]"
              :placeholder="'Option ' + (index + 1)"
              class="input"
              required
            >
            <button
              type="button"
              class="btn-icon"
              @click="removeOption(index)"
              v-if="form.options.length > 2"
              :aria-label="`Supprimer l'option ${index + 1}`"
            >
              ❌
            </button>
          </div>
        </div>
        <button
          type="button"
          class="btn btn-secondary"
          @click="addOption"
          v-if="form.options.length < 6"
        >
          Ajouter une option
        </button>
      </div>

      <div class="form-group">
        <label>Réponses correctes</label>
        <div class="answers-list">
          <label
            v-for="(option, index) in form.options"
            :key="index"
            class="answer-item"
          >
            <input
              type="checkbox"
              v-model="form.correctAnswers"
              :value="index"
              :disabled="form.type === 'single' && form.correctAnswers.length > 0 && !form.correctAnswers.includes(index)"
            >
            <span>{{ option }}</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label for="points">Points</label>
        <input
          id="points"
          v-model.number="form.points"
          type="number"
          min="1"
          max="10"
          class="input"
          required
        >
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="cancel">
          Annuler
        </button>
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Ajouter') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';

export default {
  name: 'QuestionForm',
  props: {
    question: {
      type: Object,
      default: null
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const isEditing = ref(!!props.question);
    const isSubmitting = ref(false);

    const form = reactive({
      question: '',
      type: 'single',
      options: ['', ''],
      correctAnswers: [],
      points: 1
    });

    const loadQuestion = () => {
      if (isEditing.value) {
        Object.assign(form, props.question);
      }
    };

    const addOption = () => {
      form.options.push('');
    };

    const removeOption = (index) => {
      form.options.splice(index, 1);
      form.correctAnswers = form.correctAnswers.filter(i => i !== index);
    };

    const handleSubmit = async () => {
      isSubmitting.value = true;
      try {
        emit('submit', { ...form });
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la question:', error);
      } finally {
        isSubmitting.value = false;
      }
    };

    const cancel = () => {
      emit('cancel');
    };

    onMounted(loadQuestion);

    return {
      isEditing,
      isSubmitting,
      form,
      addOption,
      removeOption,
      handleSubmit,
      cancel
    };
  }
};
</script>

<style scoped>
.question-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.question-form h3 {
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.form-container {
  background-color: var(--white);
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: var(--shadow);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.input,
.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--secondary-color);
  border-radius: 0.5rem;
  background-color: var(--white);
  color: var(--text-primary);
  transition: border-color 0.2s ease;
  font-size: 1rem;
}

.input:focus,
.form-group input[type="text"]:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.radio-group {
  display: flex;
  gap: 2rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.option-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1rem;
  color: var(--error-color, #dc3545);
  transition: color 0.2s;
}
.btn-icon:hover {
  color: #a71d2a;
}

.answers-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.answer-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.answer-item input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}

.btn-primary:disabled {
  background-color: var(--secondary-color);
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--white);
  color: var(--text-primary);
  border: 1px solid var(--secondary-color);
}

.btn-secondary:hover {
  background-color: var(--secondary-color);
}

@media (max-width: 768px) {
  .question-form {
    padding: 1rem;
  }

  .form-container {
    padding: 1.5rem;
  }

  .radio-group {
    flex-direction: column;
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>