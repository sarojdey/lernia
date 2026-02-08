import React, { useState, useRef } from "react";
import { Upload, File, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";

const FileUpload = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = async (file) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    setError(null);
    setUploading(true);
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/ingest",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      onUploadSuccess(response.data);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        className={`relative p-8 border-2 border-dashed rounded-2xl transition-all duration-300 ${
          dragActive
            ? "border-indigo-500 bg-indigo-50/10 scale-[1.02]"
            : "border-slate-300 hover:border-indigo-400 bg-white/5"
        } ${uploading ? "pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={handleChange}
        />

        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              <div>
                <p className="text-lg font-medium text-slate-800">
                  Uploading {fileName}...
                </p>
                <p className="text-sm text-slate-500">
                  Wait while we digest your knowledge.
                </p>
              </div>
            </>
          ) : fileName && !error ? (
            <>
              <CheckCircle className="w-12 h-12 text-emerald-500" />
              <div>
                <p className="text-lg font-medium text-slate-800">
                  {fileName} Ingested!
                </p>
                <button
                  onClick={onButtonClick}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 underline mt-2"
                >
                  Upload another?
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-indigo-50 rounded-full">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-800">
                  Drag & drop your PDF or{" "}
                  <button
                    onClick={onButtonClick}
                    className="text-indigo-600 hover:underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Maximum file size: 10MB
                </p>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-rose-500 bg-rose-50 px-4 py-2 rounded-lg mt-4 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
