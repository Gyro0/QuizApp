import { ref } from 'vue';
import { useFirestore } from './useFirestore';
import { db } from '@/firebase/firebaseInit';

export function useLeaderboard() {
  const { addItem, getItems, error: fsError } = useFirestore('leaderboard');
  
  const leaderboard = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  
  // Helper to handle common async operation patterns
  const executeOperation = async (operation, errorMessage) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      error.value = err.message || fsError.value || errorMessage;
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Fetch global leaderboard or quiz-specific leaderboard
  const fetchLeaderboard = async (quizId = null, limit = 50) => {
    return executeOperation(async () => {
      // Create constraints for the query
      const constraints = [
        { name: 'orderBy', field: 'score', direction: 'desc' },
        { name: 'limit', value: limit }
      ];
      
      // Add quiz ID constraint if specified
      if (quizId) {
        constraints.unshift({ field: 'quizId', op: '==', value: quizId });
      }
      
      const results = await getItems(constraints);
      leaderboard.value = results || [];
      return results;
    }, 'Error fetching leaderboard');
  };
  
  // Fetch user's best scores
  const fetchUserBestScores = async (userId) => {
    return executeOperation(async () => {
      const constraints = [
        { field: 'userId', op: '==', value: userId },
        { name: 'orderBy', field: 'timestamp', direction: 'desc' }
      ];
      
      return await getItems(constraints);
    }, 'Error fetching user scores');
  };
  
  // Add a score to the leaderboard
  const addScore = async (scoreData) => {
    return executeOperation(async () => {
      // Create a safe score object with validated data types
      const safeScore = {
        quizId: String(scoreData.quizId || 'unknown'),
        quizTitle: String(scoreData.quizTitle || 'Untitled Quiz'),
        userId: String(scoreData.userId || 'anonymous'),
        displayName: typeof scoreData.displayName === 'string' && scoreData.displayName.trim()
          ? scoreData.displayName.trim()
          : 'Anonymous User',
        score: Number(scoreData.score || 0),
        totalQuestions: Number(scoreData.totalQuestions || 0),
        timestamp: new Date()
      };
      
      return await addItem(safeScore);
    }, 'Error adding leaderboard entry');
  };
  
  // Get user rank for a specific quiz
  const getUserRank = async (quizId, userId) => {
    // Skip operation if parameters are invalid
    if (!quizId || !userId) return null;
    
    return executeOperation(async () => {
      // Get all scores for this quiz
      const snapshot = await db.collection('leaderboard')
        .where('quizId', '==', quizId)
        .orderBy('score', 'desc')
        .get();
      
      if (snapshot.empty) return null;
      
      // Convert to array and process ranking
      const scores = [];
      snapshot.forEach(doc => scores.push({ id: doc.id, ...doc.data() }));
      
      // Calculate user's rank
      let rank = 0;
      let previousScore = null;
      let sameRankCount = 0;
      
      for (const score of scores) {
        // If score changes, update rank and reset counter
        if (previousScore !== score.score) {
          rank += 1 + sameRankCount;
          sameRankCount = 0;
          previousScore = score.score;
        } else {
          sameRankCount++;
        }
        
        // Found our user
        if (score.userId === userId) {
          return {
            rank,
            total: scores.length,
            score: score.score
          };
        }
      }
      
      return null; // User not found in scores
    }, 'Error getting user rank');
  };
  
  return {
    leaderboard,
    isLoading,
    error,
    fetchLeaderboard,
    fetchUserBestScores,
    addScore,
    getUserRank
  };
}