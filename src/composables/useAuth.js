import { ref } from 'vue';
import { auth } from '@/firebase/firebaseInit';
import { useFirestore } from './useFirestore';

export function useAuth() {
  // State
  const currentUser = ref(null);
  const error = ref(null);
  const isLoading = ref(false);
  const isAdmin = ref(false);

  // Set up auth state listener
  auth.onAuthStateChanged(async (user) => {
    currentUser.value = user || null;
    isAdmin.value = false; // Reset admin status
    
    if (user) await checkAdminStatus();
  });

  // Check if user is an admin
  const checkAdminStatus = async () => {
    if (!currentUser.value) return;

    try {
      const { getItem } = useFirestore('users');
      const userData = await getItem(currentUser.value.uid);
      isAdmin.value = userData?.role === 'admin';
    } catch (err) {
      console.error("Error checking admin status:", err);
      isAdmin.value = false;
    }
  };

  // Auth operations with shared error handling
  const authOperation = async (operation) => {
    error.value = null;
    isLoading.value = true;
    
    try {
      return await operation();
    } catch (err) {
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // Register user
  const register = (email, password, displayName) => {
    return authOperation(async () => {
      // Create the user
      const res = await auth.createUserWithEmailAndPassword(email, password);
      if (!res.user) return null;
      
      // Update profile and save to Firestore
      await res.user.updateProfile({ displayName });
      const { setItem } = useFirestore('users');
      await setItem(res.user.uid, {
        displayName,
        email,
        role: 'user',
        createdAt: new Date()
      });
      
      return res;
    });
  };

  // Login user
  const login = (email, password) => {
    return authOperation(async () => {
      const res = await auth.signInWithEmailAndPassword(email, password);
      await checkAdminStatus();
      return res;
    });
  };

  // Logout user
  const logout = async () => {
    return authOperation(async () => {
      await auth.signOut();
      currentUser.value = null;
      isAdmin.value = false;
    });
  };

  return {
    currentUser,
    isAdmin,
    error,
    isLoading,
    register,
    login,
    logout,
    checkAdminStatus
  };
}
