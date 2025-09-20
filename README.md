# Servigenman (Monorepo)

## Estructura
- backend/ (Django)
- frontend/ (Next.js)

## Dev local
### Backend
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py runserver 0.0.0.0:8000

### Frontend
cd frontend
npm install
copy .env.example .env
npm run dev  # http://localhost:3000
