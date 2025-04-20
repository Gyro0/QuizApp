<template>
    <div class="home">
        <div class="container">
            <!-- Hero Section -->
            <section class="hero">
                <h1 class="hero-title">Bienvenue sur QuizApp</h1>
                <p class="hero-subtitle">Testez vos connaissances avec nos quiz interactifs !</p>
            </section>

            <!-- User Welcome Section -->
            <section v-if="currentUser" class="welcome-section">
                <div class="welcome-card">
                    <h2>Bienvenue, {{ currentUser.displayName || 'Utilisateur' }} !</h2>
                    <p>Prêt pour un nouveau défi ? Parcourez notre collection de quiz ci-dessous.</p>
                </div>
            </section>

            <!-- Guest CTA Section -->
            <section v-else class="cta-section">
                <div class="cta-card">
                    <p>Connectez-vous pour suivre votre progression et participer au classement !</p>
                    <div class="cta-buttons">
                        <router-link to="/login" class="btn btn-primary">Connexion</router-link>
                        <router-link to="/register" class="btn btn-secondary">Inscription</router-link>
                    </div>
                </div>
            </section>

            <!-- Category Filter Grid Component -->
            <CategoryFilterGrid
                title="Catégories populaires"
                v-model="selectedCategory"
                :categories="categories"
                :categoriesWithCounts="categoriesWithCounts"
                :isLoading="isLoadingCategories"
                @category-selected="handleCategorySelected"
            />

            <!-- Quiz List -->
            <section class="quiz-section">
                <h2 class="section-title">
                    {{ selectedCategoryName ? `Quiz - ${selectedCategoryName}` : 'Quiz récents' }}
                </h2>
                <QuizList :category="selectedCategory"/>
            </section>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useQuiz } from '@/composables/useQuiz';
import { useExternalQuiz } from '@/composables/useExternalQuiz';
import QuizList from '@/components/Quiz/QuizList.vue';
import CategoryFilterGrid from '@/components/Common/CategoryFilterGrid.vue';

export default {
    name: 'HomeView',
    components: {
        QuizList,
        CategoryFilterGrid
    },
    setup() {
        const { currentUser } = useAuth();
        const { quizzes, fetchQuizzes, isLoading: isLoadingQuizzes } = useQuiz();
        const { getCategories } = useExternalQuiz();
        const router = useRouter();
        const route = useRoute();
        
        // State
        const categories = ref([]);
        const isLoadingCategories = ref(true);
        
        // Get category from URL or default to empty
        const selectedCategory = ref(route.query.category || '');
        
        // Category ID to name mapping
        const categoryMapping = {
            9: 'Culture Générale',
            10: 'Livres',
            11: 'Films',
            12: 'Musique',
            13: 'Comédies musicales',
            14: 'Télévision',
            15: 'Jeux Vidéo',
            16: 'Jeux de société',
            17: 'Sciences',
            18: 'Informatique',
            19: 'Mathématiques',
            20: 'Mythologie',
            21: 'Sport',
            22: 'Géographie',
            23: 'Histoire',
            24: 'Politique',
            25: 'Art',
            26: 'Célébrités',
            27: 'Animaux',
            28: 'Véhicules',
            29: 'Bandes dessinées',
            30: 'Gadgets',
            31: 'Manga & Anime',
            32: 'Dessins animés'
        };
        
        // Category icons for commonly used categories
        const categoryIcons = {
            'Toutes': '📚',
            'Culture Générale': '🎯',
            'Sciences': '🔬',
            'Histoire': '📜',
            'Géographie': '🌍',
            'Sport': '⚽',
            'Technologie': '💻',
            'Informatique': '💻',
            'Livres': '📚',
            'Films': '🎬',
            'Musique': '🎵',
            'Art': '🎨',
            'Animaux': '🐾',
            'Politique': '🏛️',
            'Célébrités': '🌟',
            'Mathématiques': '🔢'
        };
        
        // Colors for categories
        const categoryColors = [
            '#e0f2fe', '#dcfce7', '#fef3c7', '#ede9fe', 
            '#fee2e2', '#dbeafe', '#fae8ff', '#ecfccb', 
            '#ffedd5', '#f1f5f9'
        ];
        
        // Get a display name for a category
        const getCategoryName = (categoryId) => {
            if (!categoryId) return '';
            
            // If it's already a name, return it
            if (isNaN(categoryId)) return categoryId;
            
            // Otherwise map the ID to name
            return categoryMapping[categoryId] || `Catégorie ${categoryId}`;
        };
        
        // Get appropriate icon for category
        const getCategoryIcon = (categoryName) => {
            return categoryIcons[categoryName] || '📌';
        };
        
        // Get a color for a category
        const getCategoryColor = (index) => {
            return categoryColors[index % categoryColors.length];
        };
        
        // Calculate categories with counts
        const categoriesWithCounts = computed(() => {
            const counts = {};
            let totalQuizzes = 0;
            
            // Count quizzes in each category
            quizzes.value.forEach(quiz => {
                if (quiz.visible !== false) {
                    const categoryKey = quiz.category || 'Autre';
                    counts[categoryKey] = (counts[categoryKey] || 0) + 1;
                    totalQuizzes++;
                }
            });
            
            // Start with "All" category
            const result = [{
                name: 'Toutes',
                icon: '📚',
                color: '#f3f4f6',
                count: totalQuizzes
            }];
            
            // Add categories that have quizzes
            const processedCategories = new Set();
            
            // First, add categories from our quizzes collection
            quizzes.value.forEach(quiz => {
                if (quiz.category && !processedCategories.has(quiz.category) && quiz.visible !== false) {
                    const categoryName = getCategoryName(quiz.category);
                    processedCategories.add(quiz.category);
                    
                    result.push({
                        id: isNaN(quiz.category) ? null : quiz.category,
                        name: categoryName,
                        icon: getCategoryIcon(categoryName),
                        color: getCategoryColor(result.length),
                        count: counts[quiz.category] || 0
                    });
                }
            });
            
            // Then add remaining categories from our external API
            categories.value.forEach((category, index) => {
                if (!processedCategories.has(category.id) && counts[category.id]) {
                    processedCategories.add(category.id);
                    result.push({
                        id: category.id,
                        name: category.name,
                        icon: getCategoryIcon(category.name),
                        color: getCategoryColor(result.length),
                        count: counts[category.id] || 0
                    });
                }
            });
            
            return result.filter(cat => cat.name === 'Toutes' || cat.count > 0);
        });
        
        // Get the name of the currently selected category
        const selectedCategoryName = computed(() => {
            if (!selectedCategory.value) return '';
            return getCategoryName(selectedCategory.value);
        });
        
        // Handle category selection
        const handleCategorySelected = (category) => {
            // Update URL with query parameter
            if (category.name === 'Toutes') {
                router.push({ path: '/', query: {} });
            } else {
                router.push({ 
                    path: '/', 
                    query: { category: category.id || category.name } 
                });
            }
        };
        
        // Load data from database
        const loadData = async () => {
            isLoadingCategories.value = true;
            
            try {
                // Load quizzes first to start computing counts
                await fetchQuizzes();
                
                // Load categories from API
                const apiCategories = await getCategories();
                categories.value = apiCategories.map((cat, index) => ({
                    ...cat,
                    icon: getCategoryIcon(cat.name),
                    color: getCategoryColor(index)
                }));
            } catch (error) {
                console.error('Error loading categories:', error);
                // Fallback to empty array
                categories.value = [];
            } finally {
                isLoadingCategories.value = false;
            }
        };
        
        onMounted(loadData);

        return {
            currentUser,
            selectedCategory,
            selectedCategoryName,
            categories,
            categoriesWithCounts,
            isLoadingCategories,
            handleCategorySelected
        };
    }
};
</script>

<style scoped>
.home {
    padding: 2rem 0;
}

/* Hero Section */
.hero {
    text-align: center;
    padding: 3rem 0;
    margin-bottom: 3rem;
    background: linear-gradient(to right, var(--primary-color), var(--primary-dark));
    color: var(--white);
    border-radius: var(--radius-lg);
}

.hero-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.hero-subtitle {
    font-size: 1.25rem;
    opacity: 0.9;
}

/* Welcome Section */
.welcome-section {
    margin-bottom: 3rem;
}

.welcome-card {
    background-color: #e0f2fe;
    border-radius: var(--radius-lg);
    padding: 2rem;
    text-align: center;
}

.welcome-card h2 {
    color: #0369a1;
    margin-bottom: 1rem;
}

/* CTA Section */
.cta-section {
    margin-bottom: 3rem;
}

.cta-card {
    background-color: var(--white);
    border-radius: var(--radius-lg);
    padding: 2rem;
    text-align: center;
    box-shadow: var(--shadow);
}

.cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1.5rem;
}

/* Categories Section */
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

/* Quiz Section */
.quiz-section {
    margin-bottom: 3rem;
}

.quiz-section :deep(.quiz-list) {
  max-width: 100%;
  padding: 0;
}
.quiz-section-2{
    max-width: 100%;
     padding: 0;
}
.quiz-section :deep(.quiz-list-content) {
  max-width: 100%;
  width: 100%;
}
@media (max-width: 768px) {
    .home {
        padding: 1rem 0;
    }

    .hero {
        padding: 2rem 1rem;
        margin-bottom: 2rem;
    }

    .hero-title {
        font-size: 2rem;
    }

    .hero-subtitle {
        font-size: 1.125rem;
    }

    .categories-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .cta-buttons {
        flex-direction: column;
    }

    .welcome-card,
    .cta-card {
        padding: 1.5rem;
    }
}
</style>