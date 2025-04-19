<template>
  <div class="quiz-page">
    <div class="container">
      <TakeQuiz 
        :quizId="quizId"
        class="quiz-container"
      />
      
      <div v-if="!currentUser && !showResults" class="auth-alert">
        <div class="alert-content">
          <div class="alert-icon">
            ⚠️
          </div>
          <div class="alert-message">
            <h3>Connexion requise</h3>
            <p>Vous devez être connecté pour compléter ce quiz et sauvegarder votre score.</p>
            <div class="alert-actions">
              <router-link to="/login" class="btn btn-primary">
                Se connecter
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TakeQuiz from '@/components/Quiz/TakeQuiz.vue'
import { useQuiz } from '@/composables/useQuiz'
import { useAuth } from '@/composables/useAuth'

export default {
  name: 'TakeQuizView',
  components: { TakeQuiz },
  setup() {
    const route = useRoute()
    const quizId = route.params.id
    const { fetchQuiz } = useQuiz()
    const { currentUser } = useAuth()

    const showResults = ref(false)
    const startTime = ref(0)

    onMounted(async () => {
      startTime.value = Date.now()
      await fetchQuiz(quizId)
    })

    return {
      quizId,
      showResults,
      currentUser
    }
  }
}
</script>

<style scoped>
.quiz-page {
  min-height: calc(100vh - 160px);
  padding: 2rem 0;
  background-color: var(--background);
}

.quiz-container {
  margin-bottom: 2rem;
}

.auth-alert {
  background-color: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  margin-top: 2rem;
}

.alert-content {
  display: flex;
  gap: 1rem;
}

.alert-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.alert-message {
  flex: 1;
}

.alert-message h3 {
  color: #92400e;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.alert-message p {
  color: #b45309;
  margin-bottom: 1rem;
}

.alert-actions {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .quiz-page {
    padding: 1rem;
  }

  .auth-alert {
    padding: 1rem;
  }

  .alert-content {
    flex-direction: column;
  }
}
</style>