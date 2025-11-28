const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
admin.initializeApp();

exports.createUser = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log('Headers received:', req.headers);
      // Verify Firebase ID token
      const idToken = req.headers.authorization?.split('Bearer ')[1];
      console.log('ID Token received:', idToken ? 'Yes' : 'No');
      if (!idToken) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
      }

      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ error: 'Token inválido o expirado.' });
      }

      console.log('Decoded token:', decodedToken);
      const callerClaims = decodedToken;

      console.log('Caller claims:', callerClaims);

      const { email, password, role, department, nombre, apellidos } = req.body;

      // Check permissions based on role hierarchy
      const allowedRoles = {
        'super_leader': ['super_leader', 'admin', 'leader', 'member'],
        'admin': ['leader', 'member'],
        'leader': ['member']
      };

      if (!allowedRoles[callerClaims.role] || !allowedRoles[callerClaims.role].includes(role)) {
        return res.status(403).json({ error: 'No tienes permisos para crear usuarios con este rol.' });
      }

      if (!email || !password || !role || !department || !nombre || !apellidos) {
        return res.status(400).json({ error: 'Faltan campos requeridos: email, password, role, department, nombre, apellidos.' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Formato de email inválido.' });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
      }

      // Create user
      let userRecord;
      try {
        userRecord = await admin.auth().createUser({
          email: email,
          password: password,
          displayName: `${nombre} ${apellidos}`,
        });
      } catch (error) {
        console.error('Error creating user in Auth:', error);
        if (error.code === 'auth/email-already-exists') {
          return res.status(400).json({ error: 'El email ya está registrado.' });
        }
        if (error.code === 'auth/invalid-email') {
          return res.status(400).json({ error: 'Email inválido.' });
        }
        if (error.code === 'auth/weak-password') {
          return res.status(400).json({ error: 'Contraseña demasiado débil.' });
        }
        return res.status(500).json({ error: 'Error creando usuario en autenticación.' });
      }

      // Set custom claims
      try {
        await admin.auth().setCustomUserClaims(userRecord.uid, {
          role: role
        });
      } catch (error) {
        console.error('Error setting custom claims:', error);
        // Try to delete the created user if claims fail
        try {
          await admin.auth().deleteUser(userRecord.uid);
        } catch (deleteError) {
          console.error('Error deleting user after claims failure:', deleteError);
        }
        return res.status(500).json({ error: 'Error configurando permisos del usuario.' });
      }

      // Create user document in Firestore (optional)
      try {
        await admin.firestore().collection('users').doc(userRecord.uid).set({
          email: email,
          role: role,
          department: department,
          nombre: nombre,
          apellidos: apellidos,
          createdAt: new Date()
        });
        console.log('User document created in Firestore');
      } catch (error) {
        console.error('Error creating user document in Firestore:', error);
        // Don't delete the user, just log the error - Firestore might not be available in emulator
        console.log('Continuing without Firestore - user created in Auth only');
      }

      res.status(200).json({ uid: userRecord.uid, message: 'Usuario creado exitosamente.' });
    } catch (error) {
      console.error('Error creando usuario:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  });
});
