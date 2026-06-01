#!/bin/bash

# Exit on error
set -e

# Load environment variables if they exist
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Define default dockerhub username (please change to your actual dockerhub username)
DOCKERHUB_USER=${1:-"<your-dockerhub-username>"}

echo "=========================================================="
echo "Building and Publishing Backend Service to Docker Hub"
echo "=========================================================="
echo "Targeting Docker Hub Repository: $DOCKERHUB_USER/inventory-backend"
echo "----------------------------------------------------------"

# Step 1: Navigate to backend folder
cd backend

# Step 2: Build the docker image
echo "--> Building production-ready backend image..."
docker build -t "$DOCKERHUB_USER/inventory-backend:latest" .

# Step 3: Prompt user to login and push
echo "--> Build completed successfully!"
echo ""
echo "To publish this image to your Docker Hub registry, run:"
echo "  1. docker login"
echo "  2. docker push $DOCKERHUB_USER/inventory-backend:latest"
echo "=========================================================="
