import admin from "firebase-admin";

const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error.stack);
  }
}

export { admin };

export async function authenticate(request) {
  const authorizationHeader = request.headers.get('authorization');

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: 'No authentication token provided.' };
  }

  const idToken = authorizationHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return { authenticated: true, user: decodedToken };
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return { authenticated: false, error: 'Invalid or expired authentication token.' };
  }
}
