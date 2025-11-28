# Iglesia Platform

Una plataforma moderna para la gestión de iglesias, construida con React, Firebase y Tailwind CSS.

## 🚀 Características

- **Gestión de Usuarios**: Sistema de roles jerárquico (Super Líder, Admin, Líder, Miembro)
- **Registro de Hermanos**: Gestión de miembros por departamento
- **Dashboard Interactivo**: Interfaz moderna y responsiva
- **Autenticación Segura**: Integración con Firebase Auth
- **Base de Datos en Tiempo Real**: Firestore para sincronización automática
- **Modo Offline**: Funciona sin conexión usando localStorage
- **Diseño Moderno**: UI/UX con Tailwind CSS y animaciones

## 🛠️ Tecnologías

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Firebase Functions (Node.js)
- **Base de Datos**: Firestore
- **Autenticación**: Firebase Auth
- **Despliegue**: Firebase Hosting

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta de Firebase

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/iglesia-platform.git
cd iglesia-platform
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Firebase
1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication y Firestore
3. Configurar las reglas de seguridad
4. Copiar las credenciales al archivo `src/firebase.js`

### 4. Configurar las funciones
```bash
cd functions
npm install
```

### 5. Ejecutar en desarrollo
```bash
# Terminal 1: Funciones
npm run serve

# Terminal 2: Frontend
npm run dev
```

## 🔧 Configuración de Firebase

### Authentication
- Habilitar proveedor de email/password
- Configurar dominios autorizados

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas de seguridad aquí
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    match /brothers/{brotherId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Rules (si se usa)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📁 Estructura del Proyecto

```
iglesia-platform/
├── public/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   ├── UserManagement.jsx
│   │   ├── BrothersForm.jsx
│   │   └── ...
│   ├── context/
│   ├── firebase.js
│   ├── constants.js
│   └── App.jsx
├── functions/
│   ├── index.js
│   └── package.json
├── firebase.json
├── tailwind.config.js
└── package.json
```

## 🎯 Uso

### Creación de Usuarios
1. Iniciar sesión como Super Líder o Admin
2. Ir a la pestaña "Usuarios"
3. Completar el formulario con email, contraseña, rol y departamento
4. El usuario podrá acceder inmediatamente

### Registro de Hermanos
1. Iniciar sesión como Líder
2. Ir a la pestaña "Hermanos"
3. Completar el formulario con nombre, email y teléfono
4. Los datos se guardan automáticamente

## 🔐 Sistema de Roles

- **Super Líder**: Control total del sistema
- **Admin**: Gestión de usuarios y contenido
- **Líder**: Gestión de hermanos en su departamento
- **Miembro**: Acceso limitado (solo lectura)

## 🌐 Despliegue

### Producción
```bash
# Construir el proyecto
npm run build

# Desplegar funciones
firebase deploy --only functions

# Desplegar hosting
firebase deploy --only hosting
```

### Desarrollo Local
```bash
# Emuladores
firebase emulators:start

# Funciones locales
cd functions && npm run serve
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte, email a tu-email@ejemplo.com o crear un issue en GitHub.

## 🙏 Agradecimientos

- Firebase por la plataforma backend
- Tailwind CSS por el framework de estilos
- React por el framework frontend
# ieppa-onuevo
