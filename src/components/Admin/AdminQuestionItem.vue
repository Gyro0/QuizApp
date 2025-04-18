<template>
  <div class="question-item p-3 mb-3 border rounded">
    <div class="d-flex justify-content-between align-items-start">
      <!-- Question Content -->
      <div class="d-flex flex-grow-1">
        <!-- Drag Handle -->
        <div class="drag-handle mr-2 text-muted flex-shrink-0">
          <i class="fas fa-grip-vertical"></i>
        </div>
        
        <!-- Question Details -->
        <div class="flex-grow-1">
          <h5>{{ index + 1 }}. {{ question.text }}</h5>
          
          <!-- Optional Image -->
          <div v-if="question.imageUrl" class="mb-2">
            <b-img :src="question.imageUrl" thumbnail height="80px" alt="Question Image"></b-img>
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
              <b-badge v-if="option === question.correctAnswer" variant="success" class="ml-1">
                Correct
              </b-badge>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex-shrink-0 ml-3">
        <b-button-group size="sm">
          <b-button variant="outline-primary" @click="$emit('edit', question)" title="Edit Question">
            <i class="fas fa-edit"></i> Edit
          </b-button>
          <b-button variant="outline-danger" @click="$emit('delete', question)" title="Delete Question">
            <i class="fas fa-trash"></i> Delete
          </b-button>
        </b-button-group>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminQuestionItem',
  props: {
    // The question object to display
    question: {
      type: Object,
      required: true
    },
    // The index of the question in the list (for numbering)
    index: {
      type: Number,
      required: true
    }
  },
  // Events emitted by the component
  emits: ['edit', 'delete']
};
</script>

<style scoped>
.question-item {
  background-color: #f8f9fa; /* Light background for the item */
  transition: background-color 0.2s ease-in-out; /* Smooth hover effect */
}

.question-item:hover {
  background-color: #e9ecef; /* Slightly darker background on hover */
}

.drag-handle {
  cursor: move; /* Indicate draggable capability */
  padding-top: 0.25rem; /* Align icon better */
}

.options {
  margin-top: 0.5rem; /* Space above options */
}

.option-item {
  padding: 0.3rem 0.6rem; /* Padding within each option */
  margin-bottom: 0.3rem; /* Space between options */
  background-color: #ffffff; /* White background for options */
  border-radius: 0.25rem; /* Rounded corners */
  border: 1px solid #dee2e6; /* Standard border */
  font-size: 0.9rem; /* Slightly smaller font for options */
}

/* Highlight the correct answer */
.option-item.correct-answer {
  background-color: #d4edda; /* Light green background */
  border-color: #c3e6cb; /* Green border */
  font-weight: bold; /* Make correct answer stand out */
}
</style>