import React from 'react';

/**
 * Reusable section renderer component for industry tariff reports
 * Provides consistent styling and layout for report sections
 */
export const renderSection = (title: string, content: JSX.Element, sectionId?: string) => (
  <div id={sectionId} className="mb-12">
    <div className="bg-gray-900 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold heading-color">{title}</h2>
      </div>
      <div className="p-4">{content}</div>
    </div>
  </div>
);
