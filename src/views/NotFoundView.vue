<template>
  <div class="not-found">
    <div class="container">
      <div class="error-container">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">Page Non Trouvée</h2>
        <p class="error-message">Oops! La page que vous recherchez n'existe pas.</p>
        <router-link to="/" class="btn btn-primary">
          Retour à l'accueil
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView'
};
</script>

<style scoped>
.not-found {
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.error-container {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  padding: 3rem 2rem;
  background-color: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.error-code {
  font-size: 6rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .error-container {
    padding: 2rem 1rem;
    margin: 0 1rem;
  }

  .error-code {
    font-size: 4rem;
  }

  .error-title {
    font-size: 1.5rem;
  }
}
</style>