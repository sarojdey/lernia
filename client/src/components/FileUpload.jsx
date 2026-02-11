import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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
      setError("Invalid format. PDF required.");
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
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      onUploadSuccess(response.data);
    } catch (err) {
      console.error(err);
      setError("Ingestion failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full shrink-0">
      <div
        className={`relative flex items-center justify-between p-4 border rounded-lg text-sm transition-all duration-200 ${
          dragActive
            ? "border-neutral-500 bg-white/5"
            : "border-white/10 bg-[#0f0f0f] hover:border-white/20"
        } ${uploading ? "pointer-events-none opacity-70" : ""}`}
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

        <div className="flex items-center space-x-3 w-full">
          {uploading ? (
            <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />
          ) : fileName && !error ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : error ? (
            <AlertCircle className="w-4 h-4 text-red-500" />
          ) : (
            <Upload className="w-4 h-4 text-neutral-500" />
          )}

          <div className="flex-1 flex items-center justify-between">
            <span className={`font-medium ${error ? 'text-red-400' : 'text-neutral-300'}`}>
              {uploading
                ? `Processing ${fileName}...`
                : fileName && !error
                ? `${fileName} active`
                : error
                ? error
                : "Drop PDF here or click to browse"}
            </span>

            {(!uploading && !fileName) || error ? (
              <button
                onClick={() => inputRef.current.click()}
                className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded text-neutral-300 transition-colors"
              >
                Select File
              </button>
            ) : null}
            
            {fileName && !uploading && !error && (
               <button
               onClick={() => {
                 setFileName(null);
                 inputRef.current.click();
               }}
               className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
             >
               Replace
             </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;