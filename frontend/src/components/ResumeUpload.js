import React, { useRef } from 'react';

function ResumeUpload({ onParse }) {
  const fileInput = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await fetch('http://localhost:5000/api/resume/parse', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.skills) onParse(data.skills);
    } catch (e) {
      onParse([]);
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 font-medium">Upload Resume for Smart Recommendations:</label>
      <input
        type="file"
        accept=".pdf"
        ref={fileInput}
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 focus:outline-none"
      />
    </div>
  );
}

export default ResumeUpload;
