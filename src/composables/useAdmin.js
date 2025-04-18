import { ref } from 'vue';
import { useFirestore } from './useFirestore';
import { useAuth } from './useAuth';

export function useAdmin() {
  const { updateItem, getItems } = useFirestore('users');
  const { currentUser, isAdmin } = useAuth();
  
  const isLoading = ref(false);
  const error = ref(null);
  
  // Helper to handle admin operations with common validation and error handling
  const executeAdminAction = async (action, errorMsg) => {
    if (!isAdmin.value) {
      error.value = 'Only administrators can perform this action';
      return false;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      await action();
      return true;
    } catch (err) {
      console.error(errorMsg, err);
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Set a user as admin
  const promoteToAdmin = (userId) => 
    executeAdminAction(
      () => updateItem(userId, { role: 'admin' }),
      'Error promoting user:'
    );
  
  // Remove admin privileges
  const demoteFromAdmin = async (userId) => {
    if (userId === currentUser.value?.uid) {
      error.value = 'You cannot demote yourself';
      return false;
    }
    
    return executeAdminAction(
      () => updateItem(userId, { role: 'user' }),
      'Error demoting user:'
    );
  };
  
  // Get all admin users
  const getAdminUsers = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      return await getItems([{ field: 'role', op: '==', value: 'admin' }]);
    } catch (err) {
      console.error('Error fetching admin users:', err);
      error.value = err.message;
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  return {
    isLoading,
    error,
    promoteToAdmin,
    demoteFromAdmin,
    getAdminUsers
  };
}