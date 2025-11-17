#!/bin/bash

# K3s installation and setup script for HostLiger
# This script installs K3s and deploys the DharmaSikhara application

echo "Starting K3s installation..."

# Update system packages
sudo apt update -y

# Install K3s
curl -sfL https://get.k3s.io | sh -

# Wait for K3s to start
echo "Waiting for K3s to start..."
sleep 30

# Check K3s status
sudo k3s kubectl get nodes

# Copy kubeconfig for kubectl access
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config

echo "K3s installation completed!"

# Create directories for application code
sudo mkdir -p /home/k8s/dharmasikhara
sudo chown -R $USER:$USER /home/k8s/dharmasikhara

echo "Directories created for application code!"

echo "Setup completed successfully!"
echo "Next steps:"
echo "1. Copy your application code to /home/k8s/dharmasikhara"
echo "2. Apply the Kubernetes manifests using:"
echo "   kubectl apply -f k8s-deployment/"