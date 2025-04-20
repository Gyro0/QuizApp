<template>
  <div class="leaderboard-snippet">
    <h4 class="snippet-title">Top Scores</h4>
    <div v-if="isLoading" class="loading-state">Loading...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>
    <div v-else-if="!entries || entries.length === 0" class="empty-state">
      No scores recorded yet.
    </div>
    <ol v-else class="score-list">
      <li v-for="(entry, index) in limitedEntries" :key="entry.id" class="score-item">
        <span class="rank">{{ index + 1 }}.</span>
        <span class="user">{{ entry.displayName }}</span>
        <span class="score">{{ entry.score }} pts</span>
      </li>
    </ol>
    <router-link v-if="quizId" :to="`/leaderboard/${quizId}`" class="view-full-leaderboard">
      View Full Leaderboard
    </router-link>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'QuizLeaderboardSnippet',
  props: {
    entries: {
      type: Array,
      default: () => []
    },
    limit: {
      type: Number,
      default: 5
    },
    quizId: {
      type: String,
      default: null
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const limitedEntries = computed(() => {
      return props.entries.slice(0, props.limit);
    });

    return {
      limitedEntries
    };
  }
};
</script>

<style scoped>
.leaderboard-snippet {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  border: 1px solid #e9ecef;
}

.snippet-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.score-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
  font-size: 0.95rem;
}

.score-item:last-child {
  border-bottom: none;
}

.rank {
  font-weight: bold;
  color: #6c757d;
  min-width: 25px;
}

.user {
  flex-grow: 1;
  margin: 0 0.5rem;
  color: var(--text-primary);
}

.score {
  font-weight: bold;
  color: var(--primary-color, #007bff);
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 1rem 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.view-full-leaderboard {
  display: block;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--primary-color, #007bff);
  text-decoration: none;
  font-weight: 500;
}

.view-full-leaderboard:hover {
  text-decoration: underline;
}
</style>
