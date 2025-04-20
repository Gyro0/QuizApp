<template>
  <div class="leaderboard-snippet card">
    <div class="card-header">
      <h4 class="card-title">Top Scores</h4>
    </div>
    <div v-if="isLoading" class="card-body text-center">
      <div class="spinner-border spinner-border-sm" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else-if="error" class="card-body">
      <div class="alert alert-warning">{{ error }}</div>
    </div>
    <div v-else-if="leaderboard.length === 0" class="card-body">
      <p class="text-muted">No scores submitted yet.</p>
    </div>
    <ul v-else class="list-group list-group-flush">
      <li v-for="(entry, index) in leaderboard" :key="entry.id" class="list-group-item d-flex justify-content-between align-items-center">
        <span>{{ index + 1 }}. {{ entry.displayName }}</span>
        <span class="badge bg-primary rounded-pill">{{ entry.score }} / {{ entry.totalQuestions }}</span>
      </li>
    </ul>
    <div class="card-footer text-center">
       <router-link :to="`/leaderboard/${quizId}`" class="btn btn-sm btn-outline-primary">View Full Leaderboard</router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useLeaderboard } from '@/composables/useLeaderboard';

export default {
  name: 'LeaderboardSnippet',
  props: {
    quizId: {
      type: String,
      required: true
    },
    limit: {
      type: Number,
      default: 5
    }
  },
  setup(props) {
    const { fetchLeaderboard, leaderboard, isLoading, error } = useLeaderboard();

    const loadLeaderboard = () => {
      if (props.quizId) {
        fetchLeaderboard(props.quizId, props.limit);
      }
    };

    onMounted(loadLeaderboard);
    watch(() => props.quizId, loadLeaderboard); // Reload if quizId changes

    return {
      leaderboard,
      isLoading,
      error
    };
  }
};
</script>

<style scoped>
.leaderboard-snippet {
  /* Add specific styles if needed, card styles might be sufficient */
}
.card-title {
    margin-bottom: 0; /* Adjust title margin */
}
.list-group-item {
    font-size: 0.95rem;
}
.card-footer {
    background-color: #f8f9fa; /* Light background for footer */
}

/* Basic Bootstrap-like styles if not globally available */
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: #fff;
  background-clip: border-box;
  border: 1px solid rgba(0,0,0,.125);
  border-radius: .25rem;
  margin-bottom: 1rem; /* Added margin */
}
.card-header {
  padding: .5rem 1rem;
  margin-bottom: 0;
  background-color: rgba(0,0,0,.03);
  border-bottom: 1px solid rgba(0,0,0,.125);
}
.card-body {
  flex: 1 1 auto;
  padding: 1rem 1rem;
}
.card-footer {
  padding: .5rem 1rem;
  background-color: rgba(0,0,0,.03);
  border-top: 1px solid rgba(0,0,0,.125);
}
.list-group {
  display: flex;
  flex-direction: column;
  padding-left: 0;
  margin-bottom: 0;
  border-radius: .25rem;
}
.list-group-flush > .list-group-item {
  border-width: 0 0 1px;
}
.list-group-flush > .list-group-item:last-child {
  border-bottom-width: 0;
}
.list-group-item {
  position: relative;
  display: block;
  padding: .5rem 1rem;
  color: #212529;
  text-decoration: none;
  background-color: #fff;
  border: 1px solid rgba(0,0,0,.125);
}
.d-flex { display: flex !important; }
.justify-content-between { justify-content: space-between !important; }
.align-items-center { align-items: center !important; }
.text-center { text-align: center !important; }
.text-muted { color: #6c757d !important; }
.badge {
  display: inline-block;
  padding: .35em .65em;
  font-size: .75em;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: .25rem;
}
.bg-primary { background-color: #0d6efd !important; }
.rounded-pill { border-radius: 50rem !important; }
.spinner-border {
    display: inline-block;
    width: 2rem;
    height: 2rem;
    vertical-align: -0.125em;
    border: 0.25em solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: .75s linear infinite spinner-border;
}
.spinner-border-sm {
    width: 1rem;
    height: 1rem;
    border-width: 0.2em;
}
.visually-hidden {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
}
@keyframes spinner-border {
  to { transform: rotate(360deg); }
}
.alert {
  position: relative;
  padding: 1rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: .25rem;
}
.alert-warning {
  color: #664d03;
  background-color: #fff3cd;
  border-color: #ffecb5;
}
.btn {
  display: inline-block;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  text-align: center;
  text-decoration: none;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  background-color: transparent;
  border: 1px solid transparent;
  padding: .375rem .75rem;
  font-size: 1rem;
  border-radius: .25rem;
  transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
}
.btn-sm {
  padding: .25rem .5rem;
  font-size: .875rem;
  border-radius: .2rem;
}
.btn-outline-primary {
  color: #0d6efd;
  border-color: #0d6efd;
}
.btn-outline-primary:hover {
  color: #fff;
  background-color: #0d6efd;
  border-color: #0d6efd;
}
</style>
