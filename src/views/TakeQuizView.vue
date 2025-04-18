<template>
  <div class="take-quiz-view">
    <b-container>
      <TakeQuiz 
        :quizId="quizId"
      />
      
      <b-alert v-if="!currentUser && !showResults" show variant="warning" class="mt-4">
        <h4>Login Required</h4>
        <p>You need to be logged in to complete this quiz and save your score.</p>
        <b-button variant="primary" to="/login">Login</b-button>
      </b-alert>
    </b-container>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
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