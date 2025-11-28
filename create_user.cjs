const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://iepp-67678-default-rtdb.firebaseio.com' // Reemplaza con tu database URL
});

async function createUsersFromPending() {
  try {
    const db = admin.firestore();
    const pendingUsersSnap = await db.collection('pending_users').where('status', '==', 'pending').get();

    if (pendingUsersSnap.empty) {
      console.log('No hay usuarios pendientes para crear.');
      return;
    }

    for (const doc of pendingUsersSnap.docs) {
      const userData = doc.data();
      console.log(`Creando usuario: ${userData.email}`);

      let userRecord;
      try {
        // Create user
        userRecord = await admin.auth().createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.email.split('@')[0],
        });
        console.log('Usuario creado:', userRecord.uid);
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          // User already exists, get the user record
          userRecord = await admin.auth().getUserByEmail(userData.email);
          console.log('Usuario ya existe:', userRecord.uid);
        } else {
          console.error(`Error creando usuario ${userData.email}:`, error);
          continue;
        }
      }

      // Set custom claims
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: userData.role
      });

      console.log(`Rol asignado: ${userData.role}`);

      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        email: userData.email,
        role: userData.role,
        department: userData.department,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('Documento de usuario creado en Firestore');

      // Mark as completed
      await db.collection('pending_users').doc(doc.id).update({
        status: 'completed',
        uid: userRecord.uid
      });
    }

    console.log('Proceso completado.');

  } catch (error) {
    console.error('Error:', error);
  }
}

createUsersFromPending();
