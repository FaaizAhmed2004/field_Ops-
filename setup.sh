#!/bin/bash
# fieldOps Quick Start Script

echo "=========================================="
echo "FieldOps - Quick Start Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo ""

# Check if MongoDB is running
if ! mongosh --version &> /dev/null; then
    echo "⚠️  MongoDB CLI tools not found, but you can still run MongoDB locally."
    echo "    Make sure MongoDB service is running on localhost:27017"
else
    echo "✅ MongoDB tools found"
fi

echo ""
echo "Step 1: Install Backend Dependencies"
echo "=========================================="
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo ""
echo "Step 2: Create Backend Environment File"
echo "=========================================="
if [ ! -f .env ]; then
    cp ../.env.example .env
    echo "✅ Created backend/.env from template"
    echo "   (Default values are already set for local development)"
else
    echo "✅ backend/.env already exists"
fi

echo ""
echo "Step 3: Install Frontend Dependencies"
echo "=========================================="
cd ../frontend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo ""
echo "Step 4: Create Frontend Environment File"
echo "=========================================="
if [ ! -f .env.local ]; then
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo "✅ Created frontend/.env.local"
else
    echo "✅ frontend/.env.local already exists"
fi

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then visit: http://localhost:3000"
echo ""
echo "Demo Credentials:"
echo "  Admin:      admin@fieldops.local / Admin@123!"
echo "  Technician: tech@fieldops.local / Tech@123!"
echo "  Client:     client@fieldops.local / Client@123!"
echo ""
