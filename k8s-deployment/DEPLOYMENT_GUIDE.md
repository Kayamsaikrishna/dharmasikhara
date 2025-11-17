# Complete Deployment Guide for DharmaSikhara on K3s

## Prerequisites

1. A HostLiger VPS with:
   - Ubuntu 20.04 or later
   - At least 4GB RAM and 20GB disk space
   - SSH access with sudo privileges
2. A domain name (law.infernomach.in) pointing to your server's IP address
3. Git installed on your local machine

## Step-by-Step Deployment

### Step 1: Prepare Your Local Environment

1. Clone the DharmaSikhara repository:
   ```bash
   git clone <repository-url>
   cd dharmasikhara
   ```

2. Navigate to the k8s deployment directory:
   ```bash
   cd k8s-deployment
   ```

### Step 2: Prepare Your HostLiger Server

1. SSH into your HostLiger server:
   ```bash
   ssh root@your-server-ip
   ```

2. Update your system:
   ```bash
   apt update && apt upgrade -y
   ```

### Step 3: Install K3s

1. Run the K3s installation script:
   ```bash
   chmod +x setup-k3s.sh
   ./setup-k3s.sh
   ```

2. Wait for the installation to complete (approximately 1-2 minutes).

3. Verify K3s is running:
   ```bash
   kubectl get nodes
   ```

### Step 4: Copy Application Code to Server

1. On your local machine, copy the application code to the server:
   ```bash
   # Copy backend code
   scp -r ../backend root@your-server-ip:/home/k8s/dharmasikhara/
   
   # Copy frontend code
   scp -r ../frontend root@your-server-ip:/home/k8s/dharmasikhara/
   
   # Copy AI models
   scp -r ../models root@your-server-ip:/home/k8s/dharmasikhara/backend/
   ```

2. On the server, set proper permissions:
   ```bash
   chown -R $USER:$USER /home/k8s/dharmasikhara
   ```

### Step 5: Copy Kubernetes Manifests to Server

1. On your local machine, copy the k8s deployment files:
   ```bash
   scp -r ./* root@your-server-ip:/root/dharmasikhara-k8s/
   ```

### Step 6: Deploy the Application

1. On the server, navigate to the deployment directory:
   ```bash
   cd /root/dharmasikhara-k8s
   ```

2. Make the deployment script executable and run it:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. Wait for the deployment to complete (approximately 5-10 minutes).

### Step 7: Verify the Deployment

1. Check the status of all pods:
   ```bash
   kubectl get pods -n dharmasikhara
   ```

2. Check the services:
   ```bash
   kubectl get svc -n dharmasikhara
   ```

3. Check the ingress:
   ```bash
   kubectl get ingress -n dharmasikhara
   ```

4. All pods should be in the "Running" state.

### Step 8: Test the Application

1. Check the backend health endpoint:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. Access the application through your domain:
   ```bash
   curl http://law.infernomach.in
   ```

### Step 9: Set Up SSL (Optional but Recommended)

1. Install cert-manager:
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml
   ```

2. Create a certificate resource (you'll need to create this file):
   ```bash
   cat <<EOF > certificate.yaml
   apiVersion: cert-manager.io/v1
   kind: Certificate
   metadata:
     name: dharmasikhara-cert
     namespace: dharmasikhara
   spec:
     secretName: dharmasikhara-tls
     issuerRef:
       name: letsencrypt-prod
       kind: ClusterIssuer
     dnsNames:
     - law.infernomach.in
   EOF
   ```

3. Apply the certificate:
   ```bash
   kubectl apply -f certificate.yaml
   ```

### Step 10: Monitor the Application

1. Check logs for any issues:
   ```bash
   kubectl logs -n dharmasikhara -l app=backend
   kubectl logs -n dharmasikhara -l app=frontend
   ```

2. Monitor resource usage:
   ```bash
   kubectl top pods -n dharmasikhara
   ```

## Troubleshooting Common Issues

### Issue 1: Pods stuck in "Pending" state
- Check available resources:
  ```bash
  kubectl describe pod <pod-name> -n dharmasikhara
  ```
- Consider upgrading your VPS plan if resources are insufficient.

### Issue 2: Application not accessible through domain
- Check ingress status:
  ```bash
  kubectl describe ingress dharmasikhara-ingress -n dharmasikhara
  ```
- Verify DNS configuration for law.infernomach.in

### Issue 3: Database connection failures
- Check database pod status:
  ```bash
  kubectl get pods -n dharmasikhara
  ```
- Verify database credentials in ConfigMaps

### Issue 4: AI model loading issues
- Check backend logs for Python errors:
  ```bash
  kubectl logs -n dharmasikhara -l app=backend
  ```
- Verify model files in /home/k8s/dharmasikhara/backend/models/

## Maintenance Tasks

### Updating the Application

1. Update your local code repository:
   ```bash
   git pull origin main
   ```

2. Copy updated code to the server:
   ```bash
   scp -r ../backend root@your-server-ip:/home/k8s/dharmasikhara/
   scp -r ../frontend root@your-server-ip:/home/k8s/dharmasikhara/
   ```

3. Re-apply the Kubernetes manifests:
   ```bash
   ./deploy.sh
   ```

### Scaling the Application

1. Scale backend replicas:
   ```bash
   kubectl scale deployment backend -n dharmasikhara --replicas=3
   ```

2. Scale frontend replicas:
   ```bash
   kubectl scale deployment frontend -n dharmasikhara --replicas=3
   ```

### Backup and Recovery

1. Backup the database:
   ```bash
   kubectl exec -n dharmasikhara deployment/ferretdb-postgres -- pg_dump -U ferretdb ferretdb > backup.sql
   ```

2. Backup application code:
   ```bash
   tar -czf dharmasikhara-backup.tar.gz /home/k8s/dharmasikhara
   ```

## Conclusion

Your DharmaSikhara legal AI application is now deployed on K3s with:
- Scalable microservices architecture
- MongoDB-compatible database with PostgreSQL backend
- AI/LLM integration for legal document analysis
- Automated load balancing and failover
- Secure domain access with optional SSL

The application is ready to handle legal research, document analysis, and courtroom simulations with the power of AI.