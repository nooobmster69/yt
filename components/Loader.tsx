import React from 'react';

export const Loader = ({
  message = "Generating your masterpiece...",
  subMessage = "This can take a minute for long scripts.",
}: {
  message?: string;
  subMessage?: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
      <p className="text-gray-300 text-lg font-medium">{message}</p>
      <p className="text-gray-400 text-sm">{subMessage}</p>
    </div>
  );
};