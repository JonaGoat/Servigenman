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

Las variables definidas en `.env` permiten configurar la clave secreta, el debug, los hosts permitidos y los orígenes CORS/CSRF.

### Frontend
```
cd frontend
npm install
cp .env.example .env
npm run dev  # http://localhost:3000
```

### Autenticación
- **Endpoint**: `POST /api/login/`
- **Body**: `{ "username": "jona", "password": "200328" }`
- Devuelve un mensaje de éxito y los datos básicos del usuario cuando las credenciales son válidas.
