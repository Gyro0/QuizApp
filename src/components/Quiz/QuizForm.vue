<template>
  <div class="quiz-form">
    <h2>{{ isEditing ? 'Modifier le quiz' : 'Créer un nouveau quiz' }}</h2>
    
    <form @submit.prevent="handleSubmit" class="form-container">
      <div class="form-group">
        <label for="title">Titre du quiz</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          class="input"
          required
          placeholder="Entrez le titre du quiz"
        >
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          class="input"
          required
          placeholder="Décrivez le contenu du quiz"
          rows="3"
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="category">Catégorie</label>
          <select
            id="category"
            v-model="form.category"
            class="input"
            required
          >
            <option value="">Sélectionnez une catégorie</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="difficulty">Difficulté</label>
          <select
            id="difficulty"
            v-model="form.difficulty"
            class="input"
            required
          >
            <option value="">Sélectionnez la difficulté</option>
            <option value="facile">Facile</option>
            <option value="moyen">Moyen</option>
            <option value="difficile">Difficile</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="timeLimit">Durée (minutes)</label>
          <input
            id="timeLimit"
            v-model.number="form.timeLimit"
            type="number"
            class="input"
            min="1"
            max="120"
            required
          >
        </div>

        <div class="form-group">
          <label for="passingScore">Score de passage (%)</label>
          <input
            id="passingScore"
            v-model.number="form.passingScore"
            type="number"
            class="input"
            min="0"
            max="100"
            required
          >
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="cancel">
          Annuler
        </button>
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Créer') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuiz } from '@/composables/useQuiz';

export default {
  name: 'QuizForm',
  props: {
    quizId: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const router = useRouter();
    const { createQuiz, updateQuiz, getQuiz } = useQuiz();
    
    const isEditing = ref(!!props.quizId);
    const isSubmitting = ref(false);
    
    const categories = [
      'Général',
      'Science',
      'Histoire',
      'Géographie',
      'Sport',
      'Culture',
      'Technologie'
    ];

    const form = reactive({
      title: '',
      description: '',
      category: '',
      difficulty: '',
      timeLimit: 10, // Default to 10 minutes
      passingScore: 60
    });

    const loadQuiz = async () => {
      if (isEditing.value) {
        const quiz = await getQuiz(props.quizId);
        if (quiz) {
          // Ensure timeLimit has a value when loading existing quiz
          quiz.timeLimit = quiz.timeLimit || 10;
          Object.assign(form, quiz);
        }
      }
    };

    const handleSubmit = async () => {
      isSubmitting.value = true;
      try {
        // Ensure timeLimit is a number
        form.timeLimit = parseInt(form.timeLimit) || 10;
        
        if (isEditing.value) {
          await updateQuiz(props.quizId, form);
        } else {
          await createQuiz(form);
        }
        router.push('/admin/quizzes');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du quiz:', error);
      } finally {
        isSubmitting.value = false;
      }
    };

    const cancel = () => {
      router.push('/admin/quizzes');
    };

    onMounted(loadQuiz);

    return {
      isEditing,
      isSubmitting,
      categories,
      form,
      handleSubmit,
      cancel
    };
  }
};
</script>

<style scoped>
.quiz-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.quiz-form h2 {
  color: var(--text-primary);
  font-size: 1.75rem;
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
.form-group input,
.form-group select,
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
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
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
  .quiz-form {
    padding: 1rem;
  }

  .form-container {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>