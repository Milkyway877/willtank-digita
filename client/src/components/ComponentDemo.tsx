import React from 'react';
import { DefaultDemo, CustomColorDemo } from './ExpandableTabsDemo';

const ComponentDemo: React.FC = () => {
  return (
    <section id="component-demo" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              Interactive Components
            </span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Experience our expandable tab components for efficient navigation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
              Default Style
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Our default expandable tabs with primary color accents.
            </p>
            <DefaultDemo />
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
              Custom Colors
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Customize the tabs with your own color scheme.
            </p>
            <CustomColorDemo />
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-neutral-700 dark:text-neutral-300 mb-4">
            These interactive components help users navigate through different sections efficiently. Click on any icon to expand the tab.
          </p>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            Try clicking outside to collapse all tabs.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ComponentDemo;