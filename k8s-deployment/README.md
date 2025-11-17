# DharmaSikhara K3s Deployment Guide

This guide provides instructions for deploying the DharmaSikhara legal AI application on K3s.

## Prerequisites

1. A HostLiger VPS with at least 4GB RAM and 20GB disk space
2. SSH access to the server
3. A domain name (law.infernomach.in) pointing to your server's IP address

## Deployment Steps

### 1. Install K3s

```bash
# Run the setup script
chmod +x setup-k3s.sh
./setup-k3s.sh
```

### 2. Copy Application Code

Copy your application code to the appropriate directories:

```bash
# Copy backend code
cp -r ../backend/* /home/k8s/dharmasikhara/backend/

# Copy frontend code
cp -r ../frontend/* /home/k8s/dharmasikhara/frontend/

# Copy AI models
cp -r ../models/* /home/k8s/dharmasikhara/backend/models/
```

### 3. Deploy the Application

```bash
# Make the deployment script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

### 4. Verify the Deployment

```bash
# Check the status of pods
kubectl get pods -n dharmasikhara

# Check services
kubectl get svc -n dharmasikhara

# Check ingress
kubectl get ingress -n dharmasikhara
```

## Resource Allocation

The deployment is configured with the following resource allocations:

- Backend: 1-2 CPU, 2GB RAM (scales to 4GB on demand)
- FerretDB: 0.5 CPU, 1GB RAM
- Frontend: 0.5 CPU, 512MB RAM
- PostgreSQL: 0.5 CPU, 512MB RAM

## SSL Certificate Setup

To enable HTTPS, install cert-manager:

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml
```

Then create a Certificate resource for your domain.

## Monitoring and Maintenance

Monitor the application using:

```bash
# Check logs
kubectl logs -n dharmasikhara -l app=backend

# Check resource usage
kubectl top pods -n dharmasikhara
```

## Scaling

To scale the application:

```bash
# Scale backend replicas
kubectl scale deployment backend -n dharmasikhara --replicas=3

# Scale frontend replicas
kubectl scale deployment frontend -n dharmasikhara --replicas=3
```