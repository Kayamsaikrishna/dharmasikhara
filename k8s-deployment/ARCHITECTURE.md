# DharmaSikhara K3s Deployment Architecture

## Overview

This document describes the Kubernetes deployment architecture for the DharmaSikhara legal AI application on K3s.

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│  law.infernomach.in (Domain)            │
└────────────────┬────────────────────────┘
                 │
         ┌───────▼────────┐
         │  Nginx Ingress  │ (Load Balancer)
         └───────┬────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼────┐  ┌───▼────┐  ┌───▼────┐
│Frontend│  │Backend │  │FerretDB│
│(React/ │  │(Node.js│  │(Mongo  │
│ Next)  │  │+ LLM)  │  │ compat)│
└────────┘  └────────┘  └────────┘
                 │            │
          ┌──────▼────┐       │
          │PostgreSQL │       │
          │(Storage)  │◄──────┘
          └───────────┘
```

## Components

### 1. Namespace
- **dharmasikhara**: Isolated namespace for all application components

### 2. Database Layer
- **FerretDB**: MongoDB-compatible database running on:
  - Port: 27017
  - Storage: 2Gi PersistentVolume
- **PostgreSQL**: Backend storage for FerretDB:
  - Port: 5432
  - Storage: 5Gi PersistentVolume

### 3. Backend Layer
- **Node.js Application**:
  - Port: 5000
  - Replicas: 2 (scalable)
  - Resources: 1-2 CPU, 2GB RAM
  - Features:
    - REST API endpoints
    - Python AI integration
    - Document analysis
    - Legal assistant functionality

### 4. Frontend Layer
- **React Application**:
  - Port: 3000
  - Replicas: 2 (scalable)
  - Resources: 0.5 CPU, 512MB RAM
  - Features:
    - User interface
    - Scenario simulations
    - Legal research tools
    - Courtroom simulations

### 5. AI/ML Components
- **InLegalLLaMA Model**:
  - Storage: 10Gi PersistentVolume
  - Accessed by backend Python processes
  - Used for document analysis and legal assistance

### 6. Ingress Controller
- **Nginx Ingress**:
  - Routes traffic to appropriate services
  - Handles law.infernomach.in domain
  - Path-based routing:
    - `/` → Frontend
    - `/api` → Backend

## Resource Requirements

### Minimum Requirements
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB

### Recommended Requirements
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB

## Scaling Strategy

### Horizontal Scaling
- Backend: Scales based on CPU usage (>70%)
- Frontend: Scales based on request volume
- Database: Manual scaling for storage

### Vertical Scaling
- Resource limits can be adjusted in deployment files
- Monitor resource usage with `kubectl top`

## Security Considerations

### Network Policies
- All components isolated in namespace
- Service-to-service communication only
- External access only through ingress

### Secrets Management
- JWT secrets stored in ConfigMaps (should be moved to Kubernetes Secrets in production)
- Database credentials secured through environment variables

### Data Protection
- PersistentVolumes for data persistence
- Regular backups recommended
- SSL/TLS encryption for data in transit

## Monitoring and Logging

### Built-in Monitoring
- Kubernetes resource monitoring
- Pod health checks
- Service availability monitoring

### Application Logging
- Container logs accessible via `kubectl logs`
- Structured logging in application code
- Error reporting and metrics collection

## Backup and Recovery

### Database Backup
- Regular dumps of PostgreSQL database
- FerretDB data export capabilities
- Automated backup scripts recommended

### Application Backup
- Git version control for code
- Model versioning for AI components
- Configuration backups

## Maintenance

### Updates
- Rolling updates for zero-downtime deployments
- Blue-green deployment strategy available
- Canary releases for new features

### Patching
- Kubernetes version updates
- Security patches for base images
- Dependency updates for Node.js and Python

## Troubleshooting

### Common Issues
1. **Model Loading Failures**:
   - Check PersistentVolume access
   - Verify model file integrity
   - Monitor resource usage

2. **Database Connection Issues**:
   - Check service endpoints
   - Verify network policies
   - Review credentials

3. **Ingress Routing Problems**:
   - Check domain configuration
   - Verify path mappings
   - Review SSL certificates

### Diagnostic Commands
```bash
# Check pod status
kubectl get pods -n dharmasikhara

# Check service status
kubectl get svc -n dharmasikhara

# Check ingress status
kubectl get ingress -n dharmasikhara

# View logs
kubectl logs -n dharmasikhara -l app=backend

# Check resource usage
kubectl top pods -n dharmasikhara
```