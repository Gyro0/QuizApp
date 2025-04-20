<template>
  <router-link :to="{ name: 'quiz-detail', params: { id: quiz.id } }" class="quiz-card-link">
    <div class="quiz-card">
      <div class="quiz-card-content">
        <div class="quiz-card-main">
          <h3 class="quiz-title">{{ quiz.title }}</h3>
          <p class="quiz-description">{{ quiz.description || 'Aucune description disponible.' }}</p>
          
          <div class="quiz-meta">
            <span v-if="quiz.categoryName" class="quiz-category">{{ quiz.categoryName }}</span>
            <span v-else-if="quiz.category" class="quiz-category">{{ quiz.category }}</span>
            <span v-if="quiz.difficulty" class="quiz-difficulty" :class="quiz.difficulty">
              {{ quiz.difficulty }}
            </span>
          </div>
        </div>
        
        <div class="quiz-card-stats">
          <div class="stat">
            <span class="stat-icon">📊</span>
            <span class="stat-value">{{ quiz.questionsCount }} questions</span>
          </div>
          <div class="stat">
            <span class="stat-icon">⏱️</span>
            <span class="stat-value">{{ formatTime(quiz.timeLimit) }}</span>
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script>
export default {
  name: 'QuizCard',
  props: {
    quiz: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatTime(minutes) {
      if (!minutes) return 'N/A';
      return `${minutes} min`;
    }
  }
};
</script>

<style scoped>
.quiz-card-link {
  text-decoration: none; /* Remove underline from link */
  color: inherit; /* Inherit text color */
  display: block; /* Ensure link takes up block space */
  height: 100%; /* Make link fill the grid item height */
}

.quiz-card {
  background-color:  #dadada9c;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
}

.quiz-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.quiz-card-content {
  display: flex;
  padding: 1.5rem;
}

.quiz-card-main {
  flex: 1;
  padding-right: 1.5rem;
}

.quiz-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary, #333);
  margin-bottom: 0.75rem;
}

.quiz-description {
  color: var(--text-secondary, #666);
  margin-bottom: 1rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.quiz-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.quiz-category {
  display: inline-block;
  font-size: 0.875rem;
  color: var(--text-primary, #333);
  background-color: var(--secondary-color-light, #e0f2fe);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-weight: 500;
  border: 1px solid var(--secondary-color, #e0e0e0);
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

.quiz-card-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: auto; /* Push stats and button to the bottom */
  padding-top: 1rem;
  border-top: 1px solid var(--secondary-color, #e0e0e0);
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.stat-icon {
  font-size: 1.25rem;
}

.stat-value {
  font-size: 0.875rem;
  color: var(--text-secondary, #666);
  font-weight: 500;
}

/* Responsive design for mobile devices */
@media (max-width: 640px) {
  .quiz-card-content {
    flex-direction: column;
  }
  
  .quiz-card-main {
    padding-right: 0;
    margin-bottom: 1.5rem;
  }
  
  .quiz-card-stats {
    border-left: none;
    border-top: 1px solid var(--secondary-color, #e0e0e0);
    padding-left: 0;
    padding-top: 1.5rem;
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
  }
  
  .stat {
    margin-bottom: 0;
  }
}
</style>