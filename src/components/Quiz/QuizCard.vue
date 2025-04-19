<template>
  <div class="quiz-card">
    <div class="quiz-card-header">
      <h3 class="quiz-title">{{ quiz.title }}</h3>
      <div class="quiz-meta">
        <span class="quiz-category">{{ quiz.category }}</span>
        <span class="quiz-difficulty" :class="quiz.difficulty">
          {{ quiz.difficulty }}
        </span>
      </div>
    </div>
    
    <div class="quiz-card-body">
      <p class="quiz-description">{{ quiz.description }}</p>
      <div class="quiz-stats">
        <div class="stat">
          <span class="stat-icon">📊</span>
          <span class="stat-value">{{ quiz.questionsCount }} questions</span>
        </div>
        <div class="stat">
          <span class="stat-icon">⏱️</span>
          <span class="stat-value">{{ quiz.timeLimit }} min</span>
        </div>
      </div>
    </div>
    
    <div class="quiz-card-footer">
      <router-link 
        :to="'/quiz/' + quiz.id" 
        class="btn btn-primary start-btn"
      >
        Commencer
      </router-link>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'QuizCard',
  props: {
    quiz: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter();

    const startQuiz = () => {
      router.push(`/quiz/${props.quiz.id}`);
    };

    return {
      startQuiz
    };
  }
};
</script>

<style scoped>
.quiz-card {
  background-color: var(--white);
  border-radius: 0.75rem;
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.quiz-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.quiz-card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--secondary-color);
}

.quiz-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.quiz-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.quiz-category {
  font-size: 0.875rem;
  color: var(--text-secondary);
  background-color: var(--secondary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
}

.quiz-difficulty {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  text-transform: capitalize;
}
.quiz-difficulty.facile {
  background-color: #dcfce7;
  color: #166534;
}
.quiz-difficulty.moyen {
  background-color: #fef3c7;
  color: #92400e;
}
.quiz-difficulty.difficile {
  background-color: #fee2e2;
  color: #991b1b;
}

.quiz-card-body {
  padding: 1.5rem;
}

.quiz-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.quiz-stats {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-icon {
  font-size: 1.25rem;
}

.stat-value {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.quiz-card-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--secondary-color);
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  outline: none;
  text-decoration: none;
  display: inline-block;
}
.btn-primary {
  background: var(--primary-color, #007bff);
  color: #fff;
}
.btn-primary:hover,
.btn-primary:focus {
  background: var(--primary-dark, #0056b3);
  box-shadow: 0 2px 8px rgba(0,123,255,0.15);
}
.start-btn:focus {
  outline: 2px solid var(--primary-color, #007bff);
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .quiz-card-header,
  .quiz-card-body,
  .quiz-card-footer {
    padding: 1rem;
  }
  .quiz-stats {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>