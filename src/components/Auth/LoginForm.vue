<template>
    <b-card title="loginform">
        <b-form @submit.prevent="handleLogin">
            <b-form-group label="Email" label-for="login-email">
                <b-form-input
                id="login-email"
                type="email"
                v-model="email"
                required
                ></b-form-input>
            </b-form-group>
            <b-form-group label="Mot de passe" label-for="login-password">
                <b-form-input
                id="login-password"
                type="password"
                v-model="password"
                required
                ></b-form-input>
            </b-form-group>
            <b-button 
            type="submit" 
            variant="primary" 
            :disabled="isLoading">Se connecter</b-button>

        </b-form>
        <b-alert v-if="error" variant="danger" show>{{ error }}</b-alert>
    </b-card>
</template>

<script>
import { ref, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';
import { useFirestore } from '@/composables/useFirestore';

export default 
{
    name: 'LoginForm',
    setup()
    {
        const email = ref('');
        const password = ref('');
        const error = ref(null);
        const router= useRouter();
        const { login, error: authError, isLoading } = useAuth();

        watch(authError, (newVal) => {
            error.value = newVal;
        });


        const handleLogin = async () =>
        {
            error.value = null;
            const res = await login(email.value, password.value);

            if (res && res.user)
            {
                const user = res.user;
                const { getUserData } = useFirestore();
                const userData = await getUserData(user.uid);

                if (userData && userData.role === 'admin')
                {
                    router.push('/admin/dashboard');
                }
                else
                {
                    router.push('/');
                }
            }
            else
            {
                error.value = 'Invalid email or password.';
            }
        }
    
        return {
                email,
                password,
                error,
                handleLogin,
                isLoading
            };
    }
}
</script>