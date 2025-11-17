#!/bin/bash

# Deployment script for DharmaSikhara application on K3s

echo "Deploying DharmaSikhara application to K3s..."

# Apply namespace
echo "Creating namespace..."
kubectl apply -f 00-namespace.yaml

# Apply database components
echo "Deploying database components..."
kubectl apply -f db/

# Apply AI model PVC
echo "Creating AI models volume..."
kubectl apply -f ai/

# Apply backend components
echo "Deploying backend..."
kubectl apply -f backend/

# Apply frontend components
echo "Deploying frontend..."
kubectl apply -f frontend/

# Apply ingress
echo "Creating ingress..."
kubectl apply -f 01-ingress.yaml

echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=600s deployment/backend -n dharmasikhara
kubectl wait --for=condition=available --timeout=600s deployment/frontend -n dharmasikhara
kubectl wait --for=condition=available --timeout=600s deployment/ferretdb -n dharmasikhara
kubectl wait --for=condition=available --timeout=600s deployment/ferretdb-postgres -n dharmasikhara

echo "Deployment completed!"
echo "Check the status of your pods with:"
echo "kubectl get pods -n dharmasikhara"