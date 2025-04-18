import { ref, computed } from 'vue';
import { useAuth } from './useAuth';
import { useFirestore } from './useFirestore';

export function useQuiz() {
    // Services
    const { currentUser } = useAuth();
    const { getItems, getItem, addItem, updateItem, deleteItem, error: firestoreError } = useFirestore('quizzes');
    const questionsFirestore = useFirestore('questions');
    
    // State
    const quizzes = ref([]);
    const currentQuiz = ref(null);
    const currentQuestions = ref([]);
    const currentQuestionIndex = ref(0);
    const userAnswers = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    
    // Helper function for API operations with common error handling
    const executeOperation = async (operation, errorMessage) => {
        isLoading.value = true;
        error.value = null;
        
        try {
            const result = await operation();
            return result;
        } catch (err) {
            error.value = err.message || firestoreError.value || errorMessage;
            return null;
        } finally {
            isLoading.value = false;
        }
    };
    
    // Computed properties
    const currentScore = computed(() => {
        if (!currentQuestions.value.length) return 0;
        
        return userAnswers.value.reduce((score, answer, index) => {
            if (index >= currentQuestions.value.length) return score;
            const question = currentQuestions.value[index];
            if (!question) return score;
            return answer === question.correctAnswer ? score + 1 : score;
        }, 0);
    });
    
    const totalPossibleScore = computed(() => currentQuestions.value.length);
    
    const currentQuestion = computed(() => 
        currentQuestions.value[currentQuestionIndex.value] || null
    );
    
    const isQuizCompleted = computed(() => 
        userAnswers.value.filter(answer => answer !== null).length > 0
    );
    
    // Fetch all quizzes
    const fetchQuizzes = async (constraints = []) => {
        return executeOperation(async () => {
            const results = await getItems(constraints);
            quizzes.value = results;
            return results;
        }, "Error fetching quizzes");
    };
    
    // Fetch specific quiz by ID
    const fetchQuiz = async (quizId) => {
        return executeOperation(async () => {
            const quiz = await getItem(quizId);
            
            if (!quiz) throw new Error("Quiz not found");
            
            currentQuiz.value = quiz;
            await fetchQuizQuestions(quizId);
            
            return quiz;
        }, "Error fetching quiz");
    };
    
    // Fetch questions for a quiz
    const fetchQuizQuestions = async (quizId) => {
        try {
            const constraints = [
                { field: 'quizId', op: '==', value: quizId },
                { name: 'orderBy', field: 'order', direction: 'asc' }
            ];
            
            const questions = await questionsFirestore.getItems(constraints);
            currentQuestions.value = questions;
            
            // Initialize answers array if needed
            const needsInitialization = !userAnswers.value.length || 
                                       userAnswers.value.length !== questions.length;
            
            if (needsInitialization) {
                userAnswers.value = new Array(questions.length).fill(null);
            }
            
            return questions;
        } catch (err) {
            error.value = err.message || firestoreError.value;
            return [];
        }
    };
    
    // Quiz CRUD operations
    const createQuiz = async (quizData) => {
        return executeOperation(async () => {
            return await addItem({
                ...quizData,
                createdBy: currentUser.value?.uid,
                createdAt: new Date()
            });
        }, "Error creating quiz");
    };
    
    const updateQuiz = async (quizId, quizData) => {
        return executeOperation(async () => {
            return await updateItem(quizId, quizData);
        }, "Error updating quiz");
    };
    
    const deleteQuiz = async (quizId) => {
        return executeOperation(async () => {
            // Delete all associated questions first
            const constraints = [{ field: 'quizId', op: '==', value: quizId }];
            const questions = await questionsFirestore.getItems(constraints);
            
            await Promise.all(questions.map(q => 
                questionsFirestore.deleteItem(q.id)
            ));
            
            // Then delete the quiz
            await deleteItem(quizId);
            return true;
        }, "Error deleting quiz");
    };
    
    // Quiz navigation
    const goToNextQuestion = () => {
        if (currentQuestionIndex.value < currentQuestions.value.length - 1) {
            currentQuestionIndex.value++;
            return true;
        }
        return false;
    };
    
    const goToPreviousQuestion = () => {
        if (currentQuestionIndex.value > 0) {
            currentQuestionIndex.value--;
            return true;
        }
        return false;
    };
    
    // Answer handling
    const answerQuestion = (answer) => {
        if (answer === undefined || answer === null || answer === '') return;
        
        // Create a new array for Vue reactivity
        const updatedAnswers = [...userAnswers.value];
        
        // Ensure array has space for this answer
        while (updatedAnswers.length <= currentQuestionIndex.value) {
            updatedAnswers.push(null);
        }
        
        // Store the answer
        updatedAnswers[currentQuestionIndex.value] = String(answer);
        userAnswers.value = updatedAnswers;
    };
    
    return {
        // State
        quizzes,
        currentQuiz,
        currentQuestions,
        currentQuestion,
        currentQuestionIndex,
        userAnswers,
        isLoading,
        error,
        
        // Computed
        currentScore,
        totalPossibleScore,
        isQuizCompleted,
        
        // Methods
        fetchQuizzes,
        fetchQuiz,
        fetchQuizQuestions,
        createQuiz,
        updateQuiz,
        deleteQuiz,
        goToNextQuestion,
        goToPreviousQuestion,
        answerQuestion
    };
}