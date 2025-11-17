#!/bin/bash

# Cleanup script to remove the DharmaSikhara deployment

echo "Cleaning up DharmaSikhara deployment..."

# Delete all resources in the dharmasikhara namespace
kubectl delete namespace dharmasikhara

# Wait for namespace to be deleted
echo "Waiting for namespace to be deleted..."
kubectl wait --for=delete namespace/dharmasikhara --timeout=120s

echo "Cleanup completed!"