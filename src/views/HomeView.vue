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

            <!-- Featured Categories -->
            <section class="categories-section">
                <h2 class="section-title">Catégories populaires</h2>
                <div class="categories-grid">
                    <div 
                        v-for="category in categories" 
                        :key="category.name"
                        class="category-card"
                        :style="{ backgroundColor: category.color }"
                    >
                        <span class="category-icon">{{ category.icon }}</span>
                        <h3 class="category-title">{{ category.name }}</h3>
                        <p class="category-count">{{ category.count }} quiz</p>
                    </div>
                </div>
            </section>

            <!-- Quiz List -->
            <section class="quiz-section">
                <h2 class="section-title">Quiz récents</h2>
                <QuizList />
            </section>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth';
import QuizList from '@/components/Quiz/QuizList.vue';

export default {
    name: 'HomeView',
    components: {
        QuizList
    },
    setup() {
        const { currentUser } = useAuth();

        const categories = ref([
            { name: 'Culture Générale', icon: '🎯', color: '#e0f2fe', count: 12 },
            { name: 'Sciences', icon: '🔬', color: '#dcfce7', count: 8 },
            { name: 'Histoire', icon: '📚', color: '#fef3c7', count: 10 },
            { name: 'Géographie', icon: '🌍', color: '#ede9fe', count: 6 },
            { name: 'Sport', icon: '⚽', color: '#fee2e2', count: 7 },
            { name: 'Technologie', icon: '💻', color: '#dbeafe', count: 9 }
        ]);

        return {
            currentUser,
            categories
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