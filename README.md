# Servigenman (Monorepo)

## Estructura
- backend/ (Django)
- frontend/ (Next.js)

## Dev local
### Backend
```
cd backend
python -m venv .venv
.\.venv\Scripts\activate  # o `source .venv/bin/activate` en Linux/macOS
pip install -r requirements.txt
copy .env.example .env     # o `cp .env.example .env`
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Las variables definidas en `.env` permiten configurar la clave secreta, el debug, los hosts permitidos y los orígenes CORS/CSRF. Los valores de ejemplo ya contemplan tanto `http://localhost:3000` como `http://127.0.0.1:3000` para que el frontend pueda comunicarse con la API sin problemas de CORS/CSRF durante el desarrollo local.

### Frontend
```
cd frontend
npm install
cp .env.example .env
npm run dev  # http://localhost:3000 (o http://127.0.0.1:3000)
```

### Autenticación
- **Endpoint**: `POST /api/login/`
- **Body**: `{ "username": "usuario", "password": "secreto" }`
- Devuelve un mensaje de éxito, los datos básicos del usuario y (si Auth0 está habilitado) los tokens obtenidos.

#### Configuración de Auth0
1. Crea una aplicación **Regular Web Application** en Auth0 y habilita el flujo "Resource Owner Password".
2. Completa las siguientes variables en `backend/.env`:
   - `AUTH0_DOMAIN`
   - `AUTH0_CLIENT_ID`
   - `AUTH0_CLIENT_SECRET`
   - Opcionales: `AUTH0_AUDIENCE`, `AUTH0_SCOPE`, `AUTH0_REALM`, `AUTH0_TIMEOUT`
3. Asegúrate de exponer el endpoint `https://<AUTH0_DOMAIN>/oauth/token` en tus reglas de firewall.
4. En el frontend (`frontend/.env`) define `NEXT_PUBLIC_ENABLE_LOGIN_API=true` para activar la llamada al backend.

El backend sincroniza los nombres y correo entregados por Auth0 con el modelo de usuario de Django y almacena los tokens (`access_token`, `id_token`, etc.) en la respuesta para que el frontend pueda reutilizarlos.
