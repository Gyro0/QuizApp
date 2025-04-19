<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">À propos</h3>
          <p class="footer-text">
            QuizApp est une plateforme interactive pour créer et participer à des quiz. 
            Testez vos connaissances et défiez vos amis !
          </p>
        </div>
        
        <div class="footer-section">
          <h3 class="footer-title">Navigation</h3>
          <ul class="footer-links">
            <li>
              <router-link to="/" class="footer-link">Accueil</router-link>
            </li>
            <li>
              <router-link to="/quizzes" class="footer-link">Quiz</router-link>
            </li>
            <li>
              <router-link to="/leaderboard" class="footer-link">Classement</router-link>
            </li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h3 class="footer-title">Contact</h3>
          <ul class="footer-links">
            <li>
              <a href="mailto:contact@quizapp.com" class="footer-link">contact@quizapp.com</a>
            </li>
            <li>
              <a href="#" class="footer-link">Support</a>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p class="copyright">
          &copy; {{ new Date().getFullYear() }} QuizApp. Tous droits réservés.
        </p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style scoped>
.footer {
  background-color: var(--white);
  border-top: 1px solid var(--secondary-color);
  padding: 3rem 0 1.5rem;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-title {
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.footer-text {
  color: var(--text-secondary);
  line-height: 1.6;
}

.footer-links {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--primary-color);
}

.footer-bottom {
  padding-top: 1.5rem;
  border-top: 1px solid var(--secondary-color);
  text-align: center;
}

.copyright {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .footer {
    padding: 2rem 0 1rem;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .footer-section {
    text-align: center;
  }

  .footer-links {
    align-items: center;
  }
}
</style>