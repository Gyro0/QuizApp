import { ref } from 'vue';
import { db } from '@/firebase/firebaseInit';

/**
 * Firebase Firestore operations composable
 */
export function useFirestore(collectionName = null) {
    const error = ref(null);
    const isLoading = ref(false);
    
    /**
     * Helper to execute database operations with standard error handling
     */
    const executeDbOperation = async (operation, errorMessage) => {
        error.value = null;
        isLoading.value = true;
        
        try {
            return await operation();
        } catch (err) {
            console.error(errorMessage, err);
            error.value = err.message;
            return null;
        } finally {
            isLoading.value = false;
        }
    };
    
    /**
     * Sanitizes data by removing undefined/null values and adds timestamp
     */
    const sanitizeData = (data, addCreatedAt = false) => {
        // Create a clean object with no undefined/null values
        const clean = {};
        Object.entries(data || {}).forEach(([k, v]) => {
            if (v !== undefined && v !== null) clean[k] = v;
        });
        
        // Add appropriate timestamps
        if (addCreatedAt) clean.createdAt = new Date();
        clean.updatedAt = new Date();
        
        // Remove any lingering undefined values (like in nested objects)
        return JSON.parse(JSON.stringify(clean));
    };

    // Get a single document by ID
    const getItem = async (id) => {
        return executeDbOperation(async () => {
            const docSnap = await db.collection(collectionName).doc(id).get();
            return docSnap.exists ? { id: docSnap.id, ...docSnap.data() } : null;
        }, `Error getting ${collectionName} document:`);
    };

    // Get all documents from a collection with optional constraints
    const getItems = async (constraints = []) => {
        return executeDbOperation(async () => {
            let query = db.collection(collectionName);
            
            // Apply constraints
            if (constraints?.length > 0) {
                constraints.forEach(constraint => {
                    if (constraint.name === 'orderBy' && constraint.field) {
                        query = query.orderBy(constraint.field, constraint.direction || 'asc');
                    } else if (constraint.name === 'limit' && constraint.value != null) {
                        query = query.limit(Number(constraint.value));
                    } else if (constraint.field && constraint.value != null) {
                        query = query.where(constraint.field, constraint.op || '==', constraint.value);
                    }
                });
            }
            
            const querySnapshot = await query.get();
            const items = [];
            
            querySnapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            return items;
        }, `Error getting ${collectionName} collection:`) || [];
    };

    // Add a new document with auto-generated ID
    const addItem = async (data) => {
        return executeDbOperation(async () => {
            const cleanData = sanitizeData(data, true);
            const docRef = await db.collection(collectionName).add(cleanData);
            return { id: docRef.id, ...cleanData };
        }, `Error adding ${collectionName} document:`);
    };

    // Set a document with specific ID
    const setItem = async (id, data) => {
        return executeDbOperation(async () => {
            const cleanData = sanitizeData(data);
            await db.collection(collectionName).doc(id).set(cleanData);
            return { id, ...cleanData };
        }, `Error setting ${collectionName} document:`);
    };

    // Update a document
    const updateItem = async (id, data) => {
        return executeDbOperation(async () => {
            const cleanData = sanitizeData(data);
            await db.collection(collectionName).doc(id).update(cleanData);
            return { id, ...cleanData };
        }, `Error updating ${collectionName} document:`);
    };

    // Delete a document
    const deleteItem = async (id) => {
        return executeDbOperation(async () => {
            await db.collection(collectionName).doc(id).delete();
            return true;
        }, `Error deleting ${collectionName} document:`) || false;
    };

    // Utility function to get user data (from 'users' collection)
    const getUserData = async (userId) => {
        return executeDbOperation(async () => {
            const docSnap = await db.collection('users').doc(userId).get();
            return docSnap.exists ? { id: docSnap.id, ...docSnap.data() } : null;
        }, 'Error getting user data:');
    };

    return {
        error,
        isLoading,
        getItem,
        getItems,
        addItem,
        setItem,
        updateItem,
        deleteItem,
        getUserData
    };
}