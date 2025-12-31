// src/Mark.jsx
import { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const Mark = () => {
  const [markdown, setMarkdown] = useState(`# Mastering Advanced Data Types in Python for AI/ML\n\nWelcome back, everyone! In our last session, we explored foundational data types essential for AI/ML engineering, data analytics, and data science. Today, we're advancing our knowledge by diving into two more powerful and widely applicable data structures: **Sets** and **Dictionaries**.\n\n## Python Sets: Collections of Unique & Unordered Elements\n\nA Python Set is conceptually similar to a mathematical set, characterized by two primary features:\n\n* **Uniqueness**: Sets inherently store only unique elements. Attempting to add a duplicate element will simply be ignored, and the set will remain unchanged.\n* **Unordered**: Unlike lists or tuples, elements within a set do not maintain any specific order. This implies that elements cannot be accessed using an index.\n\n### Set Creation and Basic Operations\n\nSets are typically created using curly braces \`{}\`. To create an empty set, you must use the \`set()\` constructor, as \`{}\` alone creates an empty dictionary.\n\n\`\`\`python\n# Creating an empty set\nempty_set = set()\n\n# Creating a set with diverse elements\nmy_set = {2, 'a', 3.14}\nprint(my_set) # Output order may vary, e.g., {'a', 2, 3.14}\n\`\`\`\n\nModifying sets involves adding or removing elements:\n\n* **Adding Elements**\n    * \`.add()\` elements are added quickly due to internal hashing.\n    * Duplicates are ignored.\n\n\`\`\`python\nmy_set.add(1)\nmy_set.add(2) # '2' already exists, no change\nprint(my_set)\n\`\`\`\n\n`);
  const [html, setHtml] = useState('');

  useEffect(() => {
    // Convert markdown to HTML and sanitize it
    const rawHtml = marked.parse(markdown);
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);
    setHtml(sanitizedHtml);
  }, [markdown]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Markdown Converter
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold mb-2">Input</h2>
            <textarea
              className="flex-grow p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Type your markdown here..."
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold mb-2">Output</h2>
            <div
              className="flex-grow p-4 bg-gray-50 border border-gray-300 rounded-md overflow-y-auto prose max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mark;