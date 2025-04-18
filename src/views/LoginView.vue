<template>
    <div class="login">
        <b-container>
            <b-row class="justify-content-center">
                <b-col cols="12" md="8" lg="6">
                    <h1 class="text-center mb-4">Login</h1>
                    <LoginForm />
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import LoginForm from '@/components/Auth/LoginForm.vue';

export default {
    name: 'LoginView',
    components: {
        LoginForm
    }
};
</script>