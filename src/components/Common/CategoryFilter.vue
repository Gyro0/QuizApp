<template>
  <div class="category-filter">
    <label class="filter-label" for="category-select">Catégorie :</label>
    <select
      id="category-select"
      class="filter-select"
      v-model="selected"
      @change="onChange"
    >
      <option value="">Toutes</option>
      <option v-for="cat in categories" :key="cat" :value="cat">
        {{ cat }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'CategoryFilter',
  props: {
    categories: {
      type: Array,
      required: true
    },
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      selected: this.modelValue
    };
  },
  watch: {
    modelValue(val) {
      this.selected = val;
    }
  },
  methods: {
    onChange() {
      this.$emit('update:modelValue', this.selected);
    }
  }
};
</script>

<style scoped>
.category-filter {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.filter-label {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 1rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--secondary-color, #e0e0e0);
  border-radius: 4px;
  background: #fafbfc;
  color: var(--text-primary);
  font-size: 1rem;
  transition: border 0.2s;
}

.filter-select:focus {
  border-color: var(--primary-color, #007bff);
  outline: none;
}

@media (max-width: 600px) {
  .category-filter {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
}
</style>