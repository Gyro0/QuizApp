<template>
    <div class="register">
        <b-container>
            <b-row class="justify-content-center">
                <b-col cols="12" md="8" lg="6">
                    <h1 class="text-center mb-4">Register</h1>
                    <RegisterForm />
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import RegisterForm from '@/components/Auth/RegisterForm.vue';

export default {
    name: 'RegisterView',
    components: {
        RegisterForm
    }
};
</script>