import React from "react";
import ErrorLayout from "../../components/layout/ErrorLayout";
const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
      <p className="text-lg text-gray-600">Essa página não existe ou foi movida.</p>
    </div>
  );
};

export default NotFound;