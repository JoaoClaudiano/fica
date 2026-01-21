import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

// Configuração do Firebase (substitua com suas credenciais)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "sua-api-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "seu-projeto.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "seu-projeto-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Funções de autenticação
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: formatUser(userCredential.user)
    };
  } catch (error) {
    console.error('Erro no login:', error);
    return {
      success: false,
      error: getFirebaseErrorMessage(error.code)
    };
  }
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: formatUser(result.user)
    };
  } catch (error) {
    console.error('Erro no login Google:', error);
    return {
      success: false,
      error: getFirebaseErrorMessage(error.code)
    };
  }
}

export async function register(email, password, userData) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Salvar dados adicionais no Firestore
    await saveUserData(userCredential.user.uid, userData);
    
    return {
      success: true,
      user: formatUser(userCredential.user)
    };
  } catch (error) {
    console.error('Erro no registro:', error);
    return {
      success: false,
      error: getFirebaseErrorMessage(error.code)
    };
  }
}

export async function logout() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Erro no logout:', error);
    return { success: false, error: error.message };
  }
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? formatUser(user) : null);
  });
}

// Funções auxiliares
function formatUser(firebaseUser) {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    role: determineRole(firebaseUser.email) // Função para determinar role baseado no email
  };
}

function getFirebaseErrorMessage(errorCode) {
  const messages = {
    'auth/invalid-email': 'Email inválido',
    'auth/user-disabled': 'Usuário desativado',
    'auth/user-not-found': 'Usuário não encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/email-already-in-use': 'Email já está em uso',
    'auth/weak-password': 'Senha muito fraca',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
    'auth/popup-closed-by-user': 'Login cancelado pelo usuário'
  };
  
  return messages[errorCode] || 'Erro na autenticação. Tente novamente.';
}

function determineRole(email) {
  // Lógica para determinar role baseado no domínio do email
  if (email.includes('@escola.gov.br')) return 'teacher';
  if (email.includes('@admin.edu')) return 'institutional';
  return 'student';
}

async function saveUserData(uid, userData) {
  // Implementar salvamento no Firestore
  // Você precisará criar uma coleção 'users' no Firestore
}