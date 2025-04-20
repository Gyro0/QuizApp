<template>
  <div class="question-item">
    <div class="question-row">
      <!-- Drag Handle -->
      <div class="drag-handle">
        <i class="fas fa-grip-vertical"></i>
      </div>

      <!-- Question Details -->
      <div class="question-details">
        <h5 class="question-title">{{ index + 1 }}. {{ question.text }}</h5>

        <!-- Optional Image -->
        <div v-if="question.imageUrl" class="question-image">
          <img :src="question.imageUrl" height="80" alt="Question Image" class="img-thumb" />
        </div>

        <!-- Options List -->
        <div class="options">
          <div
            v-for="option in question.options"
            :key="option"
            class="option-item"
            :class="{ 'correct-answer': option === question.correctAnswer }"
          >
            {{ option }}
            <span v-if="option === question.correctAnswer" class="badge badge-success ml-1">
              Correct
            </span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="question-actions">
        <button class="btn btn-outline-primary btn-sm" @click="$emit('edit', question)" title="Edit Question">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-outline-danger btn-sm" @click="$emit('delete', question)" title="Delete Question">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminQuestionItem',
  props: {
    question: { type: Object, required: true },
    index: { type: Number, required: true }
  },
  emits: ['edit', 'delete']
};
</script>

<style scoped>
.question-item {
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 1.25rem 1rem;
  margin-bottom: 1.25rem;
  transition: background 0.2s;
}
.question-item:hover {
  background: #e9ecef;
}
.question-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}
.drag-handle {
  cursor: grab;
  color: #adb5bd;
  font-size: 1.2rem;
  margin-right: 0.5rem;
  padding-top: 0.25rem;
  flex-shrink: 0;
}
.question-details {
  flex: 1;
}
.question-title {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
.question-image {
  margin-bottom: 0.5rem;
}
.img-thumb {
  border-radius: 4px;
  border: 1px solid #dee2e6;
  background: #fff;
}
.options {
  margin-top: 0.5rem;
}
.option-item {
  display: inline-block;
  padding: 0.3rem 0.7rem;
  margin: 0 0.5rem 0.3rem 0;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  font-size: 0.95rem;
  transition: background 0.2s, border 0.2s;
}
.option-item.correct-answer {
  background: #d4edda;
  border-color: #c3e6cb;
  font-weight: bold;
}
.badge {
  display: inline-block;
  padding: 0.15em 0.5em;
  font-size: 0.85em;
  border-radius: 0.25em;
  margin-left: 0.3em;
}
.badge-success {
  background: #28a745;
  color: #fff;
}
.question-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: 1rem;
  flex-shrink: 0;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.7rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.btn-sm {
  font-size: 0.95rem;
  padding: 0.3rem 0.6rem;
}
.btn-outline-primary {
  background: #fff;
  color: var(--primary-color, #007bff);
  border: 1px solid var(--primary-color, #007bff);
}
.btn-outline-primary:hover {
  background: var(--primary-color, #007bff);
  color: #fff;
}
.btn-outline-danger {
  background: #fff;
  color: #dc3545;
  border: 1px solid #dc3545;
}
.btn-outline-danger:hover {
  background: #dc3545;
  color: #fff;
}
@media (max-width: 600px) {
  .question-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  .question-actions {
    flex-direction: row;
    margin-left: 0;
    gap: 0.5rem;
  }
}
</style>