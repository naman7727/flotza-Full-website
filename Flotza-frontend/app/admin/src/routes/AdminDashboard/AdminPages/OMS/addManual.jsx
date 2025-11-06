import React, { useState, useEffect } from "react";

export default function ManualUpload() {
  const [showModal, setShowModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [finalFiles, setFinalFiles] = useState([]);

  // Lock body scroll when modal is open so only the modal itself can scroll
  useEffect(() => {
    if (showModal) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      document.body.dataset.lockScroll = 'true';
    } else if (document.body.dataset.lockScroll) {
      const top = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      delete document.body.dataset.lockScroll;
      if (top) {
        const y = parseInt(top.replace('-', '').replace('px', ''), 10) || 0;
        window.scrollTo(0, y);
      }
    }
    return () => {
      if (document.body.dataset.lockScroll) {
        const top = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        delete document.body.dataset.lockScroll;
        if (top) {
          const y = parseInt(top.replace('-', '').replace('px', ''), 10) || 0;
          window.scrollTo(0, y);
        }
      }
    };
  }, [showModal]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    setFinalFiles((prev) => [...prev, ...selectedFiles]);
    setSelectedFiles([]);
    setShowModal(false);
  };

  return (
    <div className="p-6 font-sans">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Manual Upload System</h2>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md"
      >
        Add Manual
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Upload Files</h3>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
              id="fileInput"
            />
            <button
              onClick={() => document.getElementById("fileInput").click()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
            >
              Upload
            </button>

            {/* Preview */}
            <div className="mt-4 flex flex-wrap gap-4">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="relative border rounded-lg p-2 w-28 text-center text-sm shadow"
                >
                  {file.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="mx-auto max-h-20 object-cover rounded"
                    />
                  ) : (
                    <p className="truncate text-gray-700">{file.name}</p>
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
              >
                Submit
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Uploaded Files */}
      <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-800">
        Final Uploaded Manuals
      </h3>
      <div className="flex flex-wrap gap-4">
        {finalFiles.map((file, index) => (
          <div
            key={index}
            className="border border-gray-400 rounded-lg p-2 w-28 text-center text-sm shadow"
          >
            {file.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(file)}
                alt="final"
                className="mx-auto max-h-20 object-cover rounded"
              />
            ) : (
              <p className="truncate text-gray-700">{file.name}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
