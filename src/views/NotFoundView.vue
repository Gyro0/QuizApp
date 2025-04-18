<template>
    <div class="not-found">
      <b-container class="text-center">
        <h1 class="display-1">404</h1>
        <h2 class="mb-4">Page Not Found</h2>
        <p class="lead">Oops! The page you are looking for does not exist.</p>
        <b-button variant="primary" to="/" class="mt-4">
          Return to Home
        </b-button>
      </b-container>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotFoundView'
  };
  </script>
  
  <style scoped>
  .not-found {
    padding: 100px 0;
  }
  </style>