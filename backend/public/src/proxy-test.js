fetch('/api/health')
  .then(response => response.json())
  .then(data => console.log('Proxy test result:', data))
  .catch(error => console.error('Proxy test error:', error));