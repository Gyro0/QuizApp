<template>
    <div class="home">
        <b-container>
            <b-row class="mb-4">
                <b-col>
                    <h1 class="display-4">Welcome to QuizApp</h1>
                    <p class="lead">Test your knowledge with our interactive quizzes!</p>
                </b-col>
            </b-row>

            <b-row v-if="currentUser" class="mb-4">
                <b-col>
                    <b-alert show variant="info">
                        <h4>Welcome back, {{ currentUser.displayName }}!</h4>
                        <p>Ready for another challenge? Browse our collection of quizzes below.</p>
                    </b-alert>
                </b-col>
            </b-row>

            <b-row v-else class="mb-4">
                <b-col>
                    <b-card>
                        <p>Sign in to track your progress and compete on the leaderboard!</p>
                        <div class="d-flex">
                            <b-button variant="primary" to="/login" class="mr-2">Login</b-button>
                            <b-button variant="outline-primary" to="/register">Register</b-button>
                        </div>
                    </b-card>
                </b-col>
            </b-row>

            <QuizList />
        </b-container>
    </div>
</template>

<script>
import { useAuth } from '@/composables/useAuth';
import QuizList from '@/components/Quiz/QuizList.vue';

export default {
    name: 'HomeView',
    components: {
        QuizList
    },
    setup() {
        const { currentUser } = useAuth();

        return {
            currentUser
        };
    }
};
</script>