@echo off
curl -X POST http://localhost:5000/api/ai/analyze-document-test ^
  -H "Content-Type: application/json" ^
  -d "{\"documentText\": \"This is a test legal document. It contains some legal terms and concepts that would be analyzed by the AI system. The document is not too large to exceed the payload limit.\"}"