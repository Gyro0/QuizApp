<template>
  <div class="quiz-timer">
    <div class="timer" :class="{ 'warning': isWarning }">
      <i class="far fa-clock mr-2"></i> {{ displayTime }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';

export default {
  name: 'QuizTimer',
  props: {
    duration: { type: Number, default: 600 }, // Default 10 minutes in seconds
    warningThreshold: { type: Number, default: 60 } // Warning when 60 seconds remain
  },
  emits: ['time-up', 'time-update'],
  setup(props, { emit }) {
    const seconds = ref(props.duration);
    const timer = ref(null);
    const startTime = ref(Date.now());
    
    // Format time as MM:SS
    const displayTime = computed(() => {
      const mins = Math.floor(seconds.value / 60);
      const secs = seconds.value % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    });
    
    // Determine if we should show warning state
    const isWarning = computed(() => seconds.value <= props.warningThreshold);
    
    // Timer control functions
    const startTimer = () => {
      startTime.value = Date.now();
      timer.value = setInterval(() => {
        seconds.value -= 1;
        emit('time-update', seconds.value);
        
        if (seconds.value <= 0) {
          clearInterval(timer.value);
          emit('time-up');
        }
      }, 1000);
    };
    
    const pauseTimer = () => {
      if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
      }
    };
    
    const resumeTimer = () => {
      if (!timer.value) startTimer();
    };
    
    const resetTimer = () => {
      pauseTimer();
      seconds.value = props.duration;
      startTime.value = Date.now();
    };
    
    const getElapsedTime = () => {
      const elapsed = props.duration - seconds.value;
      return `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;
    };
    
    onMounted(() => {
      startTimer();
    });
    
    onUnmounted(() => {
      pauseTimer();
    });
    
    return {
      seconds,
      displayTime,
      isWarning,
      pauseTimer,
      resumeTimer,
      resetTimer,
      getElapsedTime
    };
  }
};
</script>

<style scoped>
.quiz-timer {
  padding: 8px 15px;
  display: inline-block;
  border-radius: 20px;
  background-color: #f8f9fa;
  font-weight: bold;
}

.timer {
  color: #28a745;
}

.timer.warning {
  color: #dc3545;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>