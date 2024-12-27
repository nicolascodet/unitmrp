# Manufacturing Resource Planning (MRP) System

A comprehensive MRP system for plastic injection molding facilities, built with FastAPI and Next.js.

## Features

- **BOM Management**
  - Multi-level BOM structure
  - Component relationships
  - Process step tracking
  - Setup and cycle time management

- **Inventory Control**
  - Real-time inventory tracking
  - Batch management
  - Location tracking
  - Reorder point monitoring

- **Production Planning**
  - Machine capacity planning
  - Production scheduling
  - Real-time status tracking
  - Job progress monitoring

- **Quality Control**
  - Quality check logging
  - Defect tracking
  - Batch quality management
  - Statistical analysis

- **Machine Management**
  - Machine status monitoring
  - Maintenance scheduling
  - Downtime tracking
  - Performance metrics (MTBF)

## Tech Stack

### Backend
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- SQLite (Database)
- Pydantic (Data validation)

### Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mrp-final
   ```

2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

4. Start the development servers:
   ```bash
   # Make the run script executable
   chmod +x run.sh
   
   # Start both servers
   ./run.sh
   ```

The backend will be available at `http://localhost:8000` and the frontend at `http://localhost:3000`.

## Project Structure

```
mrp-final/
├── backend/
│   ├── app/
│   │   ├── models.py      # Database models
│   │   ├── schemas.py     # Pydantic schemas
│   │   ├── main.py        # FastAPI application
│   │   └── database.py    # Database configuration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   ├── components/   # React components
│   │   └── lib/         # Utilities
│   └── package.json
└── run.sh               # Development server script
```

## API Documentation

Once the backend server is running, you can access:
- API documentation: `http://localhost:8000/docs`
- Alternative documentation: `http://localhost:8000/redoc`

## Development

- Backend development server runs with auto-reload enabled
- Frontend development server includes hot module replacement
- SQLite database is automatically created and migrated on startup

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 