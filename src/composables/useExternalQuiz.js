import { ref } from 'vue';
import { useQuiz } from './useQuiz';
import { useFirestore } from './useFirestore';

export function useExternalQuiz() {
  const { createQuiz } = useQuiz();
  const questionsFirestore = useFirestore('questions');
  const isLoading = ref(false);
  const error = ref(null);
  
  // Fetch questions from Open Trivia DB
  const fetchFromOpenTriviaDB = async (amount = 10, category = '', difficulty = '') => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const params = new URLSearchParams({
        amount: amount,
        type: 'multiple'
      });
      
      if (category) params.append('category', category);
      if (difficulty) params.append('difficulty', difficulty);
      
      const response = await fetch(`https://opentdb.com/api.php?${params.toString()}`);
      const data = await response.json();
      
      if (data.response_code !== 0) throw new Error('Failed to fetch questions from API');
      return data.results;
    } catch (err) {
      error.value = err.message;
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  // Process questions for storage
  const processQuestions = (questions, quizId, startOrder = 0) => {
    return questions.map((q, i) => {
      const questionText = decodeHtml(q.question);
      const correctAnswer = decodeHtml(q.correct_answer);
      const incorrectAnswers = q.incorrect_answers.map(decodeHtml);
      const options = shuffleArray([correctAnswer, ...incorrectAnswers]);
      
      return {
        quizId,
        text: questionText,
        options,
        correctAnswer,
        order: startOrder + i
      };
    });
  };
  
  // Create a new quiz from Open Trivia DB questions
  const importFromOpenTriviaDB = async (amount = 10, category = '', difficulty = '', quizTitle = '', quizDescription = '') => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const questions = await fetchFromOpenTriviaDB(amount, category, difficulty);
      if (!questions.length) throw new Error('No questions returned from API');
      
      // Create the quiz
      const quizData = {
        title: quizTitle || `${difficulty} ${category} Quiz`.trim(),
        category: category || 'General Knowledge',
        description: quizDescription || `A quiz with ${amount} questions about ${category || 'various topics'}`,
        isPublished: true,
        showFeedback: true
      };
      
      const newQuiz = await createQuiz(quizData);
      if (!newQuiz) throw new Error('Failed to create quiz');
      
      // Add all questions
      const processedQuestions = processQuestions(questions, newQuiz.id);
      for (const question of processedQuestions) {
        await questionsFirestore.addItem(question);
      }
      
      return newQuiz;
    } catch (err) {
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Add questions to an existing quiz
  const importQuestionsForExistingQuiz = async (quizId, amount = 10, category = '', difficulty = '') => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const questions = await fetchFromOpenTriviaDB(amount, category, difficulty);
      if (!questions.length) throw new Error('No questions returned from API');
      
      // Get existing questions count to determine starting order
      const constraints = [{ field: 'quizId', op: '==', value: quizId }];
      const existingQuestions = await questionsFirestore.getItems(constraints);
      const startingOrder = existingQuestions.length;
      
      // Process and add questions
      const processedQuestions = processQuestions(questions, quizId, startingOrder);
      for (const question of processedQuestions) {
        await questionsFirestore.addItem(question);
      }
      
      return true;
    } catch (err) {
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Helper function to shuffle array (Fisher-Yates algorithm)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Helper function to decode HTML entities
  const decodeHtml = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };
  
  // Get available categories from Open Trivia DB
  const getCategories = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch('https://opentdb.com/api_category.php');
      const data = await response.json();
      return data.trivia_categories;
    } catch (err) {
      error.value = err.message;
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  return {
    isLoading,
    error,
    fetchFromOpenTriviaDB,
    importFromOpenTriviaDB,
    importQuestionsForExistingQuiz,
    getCategories
  };
}