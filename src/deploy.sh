#!/bin/bash

# Adoras Backend Deployment Script
# This script automates the deployment of the Supabase Edge Function

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_REF="cyaaksjydpegofrldxbo"
FUNCTION_NAME="make-server-deded1eb"
HEALTH_URL="https://${PROJECT_REF}.supabase.co/functions/v1/${FUNCTION_NAME}/health"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Adoras Backend Deployment Script    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Function to print status messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Supabase CLI is installed
print_status "Checking for Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed"
    echo ""
    echo "Please install the Supabase CLI using one of these methods:"
    echo ""
    echo "  npm install -g supabase"
    echo "  or"
    echo "  brew install supabase/tap/supabase"
    echo ""
    echo "Visit: https://supabase.com/docs/guides/cli/getting-started"
    exit 1
fi

print_success "Supabase CLI is installed"
SUPABASE_VERSION=$(supabase --version)
print_status "Version: $SUPABASE_VERSION"
echo ""

# Check if user is logged in
print_status "Checking authentication..."
if ! supabase projects list &> /dev/null; then
    print_warning "Not logged in to Supabase"
    print_status "Opening browser for authentication..."
    echo ""
    
    if ! supabase login; then
        print_error "Authentication failed"
        exit 1
    fi
    
    print_success "Successfully authenticated"
fi

print_success "Already authenticated"
echo ""

# Link to project
print_status "Linking to project: $PROJECT_REF..."
if ! supabase link --project-ref $PROJECT_REF 2>/dev/null; then
    print_warning "Project already linked or link failed"
fi

print_success "Project linked"
echo ""

# Check if function directory exists
if [ ! -d "supabase/functions/server" ]; then
    print_error "Function directory not found: supabase/functions/server"
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Deploy the function
print_status "Deploying Edge Function: $FUNCTION_NAME"
print_status "This may take 30-60 seconds..."
echo ""

if supabase functions deploy $FUNCTION_NAME --project-ref $PROJECT_REF; then
    print_success "Edge Function deployed successfully!"
else
    print_error "Deployment failed"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check the logs: supabase functions logs $FUNCTION_NAME --project-ref $PROJECT_REF"
    echo "2. Verify your project ID is correct: $PROJECT_REF"
    echo "3. Check the Supabase dashboard: https://supabase.com/dashboard"
    exit 1
fi

echo ""
print_status "Waiting 5 seconds for function to warm up..."
sleep 5

# Test the health endpoint
print_status "Testing health endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ "$HTTP_CODE" = "200" ]; then
    print_success "Health check passed! Server is online ✅"
    
    # Get the actual response
    RESPONSE=$(curl -s $HEALTH_URL)
    echo ""
    echo "Server Response:"
    echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
else
    print_error "Health check failed (HTTP $HTTP_CODE)"
    print_warning "The function may need a few more seconds to start"
    echo ""
    echo "Try testing manually:"
    echo "  curl $HEALTH_URL"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Deployment Complete!          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo "1. Refresh your Adoras app"
echo "2. The server status should show: 🟢 Server Online"
echo "3. Try signing up or logging in"
echo ""
echo "Useful commands:"
echo "  View logs:    supabase functions logs $FUNCTION_NAME --project-ref $PROJECT_REF --follow"
echo "  Test health:  curl $HEALTH_URL"
echo "  Dashboard:    https://supabase.com/dashboard"
echo ""
