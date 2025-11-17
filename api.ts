import { initializeApp, type FirebaseApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously, type Auth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    collection, 
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    writeBatch,
    query,
    where,
    serverTimestamp,
    increment,
    runTransaction,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import type { User, MainTask, PartnershipTask, AdminSettings, PromoCode, ReferredUser, WithdrawalRequest, Activity, AdminDashboardStats } from '../types';

// =================================================================================
// !! Firebase কনফিগারেশন !!
// নিচের অংশে আপনার Firebase প্রজেক্টের কনফিগারেশন যোগ করুন।
// এটি ছাড়া অ্যাপ কাজ করবে না।
// =================================================================================
const firebaseConfig = {
    apiKey: "AIzaSyAeQ4e9L6R0_kanJ3JdAFzad8jYGvccRvA",
    authDomain: "miniapp-75b57.firebaseapp.com",
    projectId: "miniapp-75b57",
    storageBucket: "miniapp-75b57.firebasestorage.app",
    messagingSenderId: "144123557006",
    appId: "1:144123557006:web:8d6908f8509a7335e7c5df"
};

// --- Firebase Initialization ---
let app: FirebaseApp;
let auth: Auth;
let db: any; // Firestore instance
let isInitialized = false;

export const initialize = async () => {
    if (isInitialized) return;
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        await signInAnonymously(auth);
        isInitialized = true;
        console.log("Firebase initialized and user signed in anonymously.");
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        if ((error as any).code === 'auth/internal-error' || (error as any).code === 'auth/network-request-failed') {
             throw new Error("Could not connect to the database. Please check your internet connection and Firebase configuration.");
        }
        throw error;
    }
};

const checkInitialization = () => {
    if (!isInitialized) {
        throw new Error("Firebase is not initialized. Call initialize() first.");
    }
};

// --- API Functions ---

// User
export const fetchUser = async (tgUser: any): Promise<User> => {
    checkInitialization();
    const userRef = doc(db, "users", tgUser.id.toString());
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        // User exists, update their info to keep it fresh
        const existingData = userSnap.data() as User;
        const updatedData: Partial<User> = {
            name: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
            id: tgUser.username ? `@${tgUser.username}` : existingData.id,
            avatarUrl: tgUser.photo_url || existingData.avatarUrl,
            avatar: tgUser.first_name.charAt(0).toUpperCase(),
        };
        await updateDoc(userRef, updatedData);
        return { ...existingData, ...updatedData };
    } else {
        // User doesn't exist, create a new one
        const settings = await fetchAdminSettings();
        const newUser: User = {
            name: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
            id: tgUser.username ? `@${tgUser.username}` : `id_${tgUser.id}`,
            telegramId: tgUser.id,
            avatar: tgUser.first_name.charAt(0).toUpperCase(),
            avatarUrl: tgUser.photo_url || `https://i.pravatar.cc/150?u=${tgUser.id}`,
            coins: 100, // Welcome bonus
            todayAds: 0,
            totalAds: 0,
            totalReferrals: 0,
            totalEarnings: 100,
            referralLink: `https://t.me/${settings.botUsername}?start=ref_${tgUser.id}`,
        };
        await setDoc(userRef, newUser);
        return newUser;
    }
};

export const fetchAllUsers = async (): Promise<User[]> => {
    checkInitialization();
    const usersCol = collection(db, "users");
    const usersSnap = await getDocs(usersCol);
    return usersSnap.docs.map(doc => doc.data() as User);
};

export const updateUser = async (user: User): Promise<User> => {
    checkInitialization();
    const userRef = doc(db, "users", user.telegramId.toString());
    await setDoc(userRef, user, { merge: true });
    return user;
};

// Tasks
export const fetchMainTasks = async (): Promise<MainTask[]> => {
    checkInitialization();
    const tasksCol = collection(db, "mainTasks");
    const tasksSnap = await getDocs(tasksCol);
    return tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MainTask));
};

export const addMainTask = async (task: Omit<MainTask, 'id' | 'completions'>): Promise<MainTask> => {
    checkInitialization();
    const newTaskData = { ...task, completions: 0 };
    const docRef = await addDoc(collection(db, "mainTasks"), newTaskData);
    return { ...newTaskData, id: docRef.id };
};

export const deleteMainTask = async (id: string): Promise<{ id: string }> => {
    checkInitialization();
    await deleteDoc(doc(db, "mainTasks", id));
    return { id };
};

export const fetchPartnershipTasks = async (): Promise<PartnershipTask[]> => {
    checkInitialization();
    const tasksCol = collection(db, "partnershipTasks");
    const tasksSnap = await getDocs(tasksCol);
    return tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PartnershipTask));
};

export const addPartnershipTask = async (task: Omit<PartnershipTask, 'id' | 'completions'>): Promise<PartnershipTask> => {
    checkInitialization();
    const newTaskData = { ...task, completions: 0 };
    const docRef = await addDoc(collection(db, "partnershipTasks"), newTaskData);
    return { ...newTaskData, id: docRef.id };
};

export const deletePartnershipTask = async (id: string): Promise<{ id: string }> => {
    checkInitialization();
    await deleteDoc(doc(db, "partnershipTasks", id));
    return { id };
};

export const incrementTaskCompletions = async (taskId: string, collectionName: 'mainTasks' | 'partnershipTasks') => {
    checkInitialization();
    const taskRef = doc(db, collectionName, taskId);
    await updateDoc(taskRef, {
        completions: increment(1)
    });
};

// Admin Settings
export const fetchAdminSettings = async (): Promise<AdminSettings> => {
    checkInitialization();
    const settingsRef = doc(db, "admin", "settings");
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
        return settingsSnap.data() as AdminSettings;
    } else {
        // Create default settings if they don't exist
        const defaultSettings: AdminSettings = {
            dailyAdLimit: 100,
            adMinPoints: 5,
            adMaxPoints: 20,
            adScriptId: '',
            premiumReferralBonus: 500,
            normalReferralBonus: 100,
            referralMessage: "Invite friends! You'll get **{premiumBonus}** coins for each Premium user and **{normalBonus}** for each normal user.",
            botUsername: 'YourBot',
            minimumWithdrawal: 1000,
        };
        await setDoc(settingsRef, defaultSettings);
        return defaultSettings;
    }
};

export const updateAdminSettings = async (settings: AdminSettings): Promise<AdminSettings> => {
    checkInitialization();
    const settingsRef = doc(db, "admin", "settings");
    await setDoc(settingsRef, settings);
    return settings;
};

// Completed Tasks
export const fetchCompletedTasks = async (telegramId: number): Promise<string[]> => {
    checkInitialization();
    const completedRef = doc(db, "completedTasks", telegramId.toString());
    const docSnap = await getDoc(completedRef);
    if (docSnap.exists()) {
        return docSnap.data().tasks || [];
    }
    return [];
};

export const addCompletedTask = async (telegramId: number, taskId: string): Promise<{ taskId: string }> => {
    checkInitialization();
    const completedRef = doc(db, "completedTasks", telegramId.toString());
    const docSnap = await getDoc(completedRef);
    if (docSnap.exists()) {
        const existingTasks = docSnap.data().tasks || [];
        if (!existingTasks.includes(taskId)) {
            await updateDoc(completedRef, { tasks: [...existingTasks, taskId] });
        }
    } else {
        await setDoc(completedRef, { tasks: [taskId] });
    }
    return { taskId };
};

// Promo Codes
export const fetchPromoCodes = async (): Promise<PromoCode[]> => {
    checkInitialization();
    const promosCol = collection(db, "promoCodes");
    const promosSnap = await getDocs(promosCol);
    return promosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PromoCode));
};

export const addPromoCode = async (promo: Omit<PromoCode, 'id'>): Promise<PromoCode> => {
    checkInitialization();
    const docRef = await addDoc(collection(db, "promoCodes"), promo);
    return { ...promo, id: docRef.id };
};

export const deletePromoCode = async (id: string): Promise<{ id: string }> => {
    checkInitialization();
    await deleteDoc(doc(db, "promoCodes", id));
    return { id };
};

export const claimPromoCode = async (code: string, telegramId: number): Promise<{ reward: number }> => {
    checkInitialization();
    const promoQuery = query(collection(db, "promoCodes"), where("code", "==", code.toUpperCase()));
    const querySnapshot = await getDocs(promoQuery);

    if (querySnapshot.empty) {
        throw new Error("Invalid promo code.");
    }

    const promoDoc = querySnapshot.docs[0];
    const promo = { id: promoDoc.id, ...promoDoc.data() } as PromoCode;

    if (promo.usesLeft <= 0) {
        throw new Error("This promo code has expired.");
    }
    
    // Check if user already claimed this code
    const claimRef = doc(db, `promoClaims/${promo.id}_${telegramId}`);
    
    return await runTransaction(db, async (transaction) => {
        const claimDoc = await transaction.get(claimRef);
        if (claimDoc.exists()) {
            throw new Error("You have already used this promo code.");
        }

        const freshPromoDoc = await transaction.get(promoDoc.ref);
        if(!freshPromoDoc.exists() || freshPromoDoc.data().usesLeft <= 0) {
            throw new Error("This promo code has just expired.");
        }

        transaction.update(promoDoc.ref, { usesLeft: increment(-1) });
        transaction.set(claimRef, { telegramId, claimedAt: serverTimestamp() });
        
        return { reward: promo.reward };
    });
};


// Referred Users
export const fetchReferredUsers = async (telegramId: number): Promise<ReferredUser[]> => {
    checkInitialization();
    // This is a simplified version. A real implementation would involve querying users
    // who have the current user's ID as their referrer. This requires a 'referredBy' field on the User object.
    // For now, returning mock data.
    console.warn("Using mock referred users data.");
    return Promise.resolve([
        { name: 'John Doe', id: '@johndoe', avatar: 'J', pointsEarned: 100, isPremium: true },
        { name: 'Jane Smith', id: '@janesmith', avatar: 'J', pointsEarned: 50, isPremium: false },
    ]);
};

// Withdrawals
export const fetchWithdrawalRequests = async (telegramId?: number): Promise<WithdrawalRequest[]> => {
    checkInitialization();
    let q = collection(db, "withdrawalRequests");
    if (telegramId) {
        q = query(q, where("telegramId", "==", telegramId));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest));
};

export const addWithdrawalRequest = async (request: Omit<WithdrawalRequest, 'id' | 'date' | 'status'>): Promise<WithdrawalRequest> => {
    checkInitialization();
    const newRequestData = {
        ...request,
        date: new Date().toISOString(),
        status: 'pending' as const
    };
    const docRef = await addDoc(collection(db, "withdrawalRequests"), newRequestData);
    return { ...newRequestData, id: docRef.id };
};

export const updateWithdrawalRequestStatus = async (id: string, status: 'completed' | 'rejected'): Promise<void> => {
    checkInitialization();
    const requestRef = doc(db, "withdrawalRequests", id);
    
    await runTransaction(db, async (transaction) => {
        const reqDoc = await transaction.get(requestRef);
        if (!reqDoc.exists()) {
            throw "Document does not exist!";
        }

        // If status is not pending, do nothing to prevent re-processing
        if (reqDoc.data().status !== 'pending') {
            console.log("Request already processed.");
            return;
        }

        transaction.update(requestRef, { status: status });

        if (status === 'rejected') {
            const requestData = reqDoc.data() as WithdrawalRequest;
            const userRef = doc(db, "users", requestData.telegramId.toString());
            transaction.update(userRef, { coins: increment(requestData.amount) });
        }
    });
};


// Dashboard (Admin only)
export const fetchDashboardStats = async (): Promise<{ stats: AdminDashboardStats; activity: Activity[] }> => {
    checkInitialization();
    // This requires complex aggregation, which is better done with Cloud Functions.
    // We will return mock data here.
    console.warn("Using mock dashboard stats.");
    return Promise.resolve({
        stats: {
            totalUsers: (await getDocs(collection(db, "users"))).size,
            totalCoinsEarned: 8765432, // Mocked
            activeUsersToday: 1234, // Mocked
            tasksCompletedToday: 5678, // Mocked
            dailyEarnings: [1200, 1500, 1300, 1800, 2200, 1900, 2500], // Mocked
        },
        activity: [ // Mocked
            { id: 'act1', text: 'John Doe completed "Join Telegram" task.', time: '2 mins ago', icon: 'fa-check-circle', color: 'text-green-500' },
            { id: 'act2', text: 'New user "Sarah" just signed up.', time: '5 mins ago', icon: 'fa-user-plus', color: 'text-blue-500' },
            { id: 'act3', text: 'Withdrawal request for 1,500 coins approved.', time: '10 mins ago', icon: 'fa-paper-plane', color: 'text-purple-500' },
        ]
    });
};
