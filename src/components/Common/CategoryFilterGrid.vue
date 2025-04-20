<template>
  <section class="categories-section">
    <h2 class="section-title">{{ title }}</h2>
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement des catégories...</p>
    </div>
    <div v-else-if="categoriesWithCounts.length === 0" class="empty-state">
      <p>Aucune catégorie disponible.</p>
    </div>
    <div v-else class="categories-grid">
      <div
        v-for="category in categoriesWithCounts"
        :key="category.id || category.name"
        @click="selectCategory(category)"
        class="category-card"
        :class="{ 'category-card--active': isActive(category) }"
        :style="{ backgroundColor: category.color }"
      >
        <span class="category-icon">{{ category.icon }}</span>
        <h3 class="category-title">{{ category.name }}</h3>
        <p class="category-count">{{ category.count }} quiz</p>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'CategoryFilterGrid',
  props: {
    title: {
      type: String,
      default: 'Catégories'
    },
    categories: {
      type: Array,
      required: true
    },
    modelValue: {
      type: [String, Number],
      default: ''
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    categoriesWithCounts: {
      type: Array,
      required: true
    }
  },
  emits: ['update:modelValue', 'category-selected'],
  setup(props, { emit }) {
    const isActive = (category) => {
      if (!props.modelValue) return category.name === 'Toutes';
      return category.id 
        ? category.id.toString() === props.modelValue.toString()
        : category.name === props.modelValue;
    };

    const selectCategory = (category) => {
      const value = category.name === 'Toutes' ? '' : (category.id || category.name);
      emit('update:modelValue', value);
      emit('category-selected', category);
    };

    return {
      isActive,
      selectCategory
    };
  }
};
</script>

<style scoped>
.categories-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.category-card {
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  text-align: center;
  transition: transform 0.2s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-4px);
}

.category-card--active {
  box-shadow: 0 0 0 3px var(--primary-color);
  transform: translateY(-4px);
}

.category-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.category-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.category-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>