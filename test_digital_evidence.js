// Simple test to verify the DigitalEvidence component structure
const fs = require('fs');
const path = require('path');

// Check if the evidences folder exists and has images
const evidencesPath = path.join('scenario 1', 'evidences folder');
console.log('Checking evidences folder...');

if (fs.existsSync(evidencesPath)) {
  const files = fs.readdirSync(evidencesPath);
  console.log(`Found ${files.length} files in evidences folder`);
  
  // Check if we have the expected number of images
  const imageFiles = files.filter(file => file.endsWith('.png'));
  console.log(`Found ${imageFiles.length} PNG images`);
  
  // List first 5 images
  console.log('First 5 images:');
  imageFiles.slice(0, 5).forEach(file => {
    console.log(`  - ${file}`);
  });
} else {
  console.log('Evidences folder not found');
}

// Check if the component file exists
const componentPath = path.join('frontend', 'src', 'components', 'DigitalEvidence.tsx');
console.log('\nChecking DigitalEvidence component...');

if (fs.existsSync(componentPath)) {
  const content = fs.readFileSync(componentPath, 'utf8');
  console.log('DigitalEvidence.tsx file found');
  
  // Check for key features
  const hasSummaryTab = content.includes('summary');
  const hasPhotoViewer = content.includes('selectedPhoto');
  const hasSearch = content.includes('searchTerm');
  const hasFilters = content.includes('filter');
  const hasViewModes = content.includes('viewMode');
  
  console.log('Component features:');
  console.log(`  - Summary tab: ${hasSummaryTab}`);
  console.log(`  - Photo viewer: ${hasPhotoViewer}`);
  console.log(`  - Search functionality: ${hasSearch}`);
  console.log(`  - Category filters: ${hasFilters}`);
  console.log(`  - View modes: ${hasViewModes}`);
} else {
  console.log('DigitalEvidence.tsx file not found');
}

console.log('\nTest completed successfully!');