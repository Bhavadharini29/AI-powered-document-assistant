import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, X, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

export function UploadPanel({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Invalid file type or size. Please upload a PDF under 10MB.');
      return;
    }
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10485760, // 10MB
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(20);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8080/documents/upload', {
        method: 'POST',
        body: formData
      });
      setProgress(60);
      
      if (res.ok) {
        setProgress(100);
        setTimeout(() => {
          toast.success('Document uploaded successfully!');
          setFile(null);
          setUploading(false);
          setProgress(0);
          if (onUploadSuccess) onUploadSuccess();
        }, 500);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }
    } catch (e) {
      setUploading(false);
      setProgress(0);
      toast.error(e.message || 'Failed to connect to server.');
    }
  };

  return (
    <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
      <h3 className="font-semibold text-lg mb-1">Document Sources</h3>
      <p className="text-sm text-muted-foreground mb-4">Upload PDFs to train your assistant</p>
      
      {!file ? (
        <div 
          {...getRootProps()} 
          className={cn(
            "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
          <p className="text-sm font-medium">Drag & drop your PDF here</p>
          <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
          <p className="text-[10px] text-muted-foreground mt-4 uppercase font-semibold tracking-wider">Max 10MB • PDF only</p>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
              <File className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {!uploading && (
              <button 
                onClick={() => setFile(null)} 
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-right text-muted-foreground">{progress}% uploaded</p>
            </div>
          )}
          
          <div className="mt-4 flex gap-2">
            {!uploading ? (
              <button 
                onClick={handleUpload}
                className="w-full py-2 bg-primary text-primary-foreground font-medium text-sm rounded-md shadow hover:bg-primary/90 transition-colors"
              >
                Upload Document
              </button>
            ) : (
              <button 
                disabled
                className="w-full py-2 bg-muted text-muted-foreground font-medium text-sm rounded-md cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 animate-pulse text-primary" />
                Uploading...
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
