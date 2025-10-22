import React from 'react';

interface TestComponentProps {
  message: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ message }) => {
  return (
    <div>
      <h1>Test Component</h1>
      <p>{message}</p>
    </div>
  );
};

export default TestComponent;