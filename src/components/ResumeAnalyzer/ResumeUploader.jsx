import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Sparkles, AlertCircle, RefreshCw, FileCheck } from 'lucide-react';
import { SAMPLE_RESUMES } from '../../data/sampleResumes';
import { extractTextFromFile } from '../../utils/pdfExtractor';

export default function ResumeUploader({ onAnalyze, isAnalyzing }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [activeMode, setActiveMode] = useState('upload'); // 'upload', 'sample', 'paste'
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processUploadedFile(file);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = async (file) => {
    setSelectedFile(file);
    setIsExtractingText(true);
    setExtractionStatus(`Extracting text from ${file.name}...`);

    try {
      const text = await extractTextFromFile(file);
      setPastedText(text);
      setIsExtractingText(false);
      setExtractionStatus(`✓ Extracted ${text.split(/\s+/).length} words from ${file.name}`);

      // Automatically run ATS analysis on real extracted text!
      onAnalyze(text, file.name);
    } catch (err) {
      console.error('Extraction error:', err);
      setIsExtractingText(false);
      setExtractionStatus('Error reading file. Try pasting plain text below.');
    }
  };

  const handleSelectSample = (sample) => {
    setPastedText(sample.rawText);
    setSelectedFile({ name: sample.filename });
    setExtractionStatus(`✓ Loaded ${sample.title}`);
    onAnalyze(sample.rawText, sample.title);
  };

  const handleStartAnalysis = () => {
    if (!pastedText.trim()) return;
    onAnalyze(pastedText, selectedFile ? selectedFile.name : 'Custom Resume');
  };

  return (
    <div className="glass-panel rounded-2xl p-6 lg:p-8 border border-slate-800 shadow-xl mb-8">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="font-heading font-extrabold text-2xl text-white">ATS Resume Scanner</h2>
          </div>
          <p className="text-xs text-slate-400">
            Upload your real PDF resume to extract text and generate an instant, accurate ATS report.
          </p>
        </div>

        {/* Input Mode Selector */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-stretch lg:self-auto">
          <button
            onClick={() => setActiveMode('upload')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'upload' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload Real Resume (PDF)
          </button>
          <button
            onClick={() => setActiveMode('sample')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'sample' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sample Resumes
          </button>
          <button
            onClick={() => setActiveMode('paste')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'paste' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Paste Text
          </button>
        </div>
      </div>

      {/* Mode 1: Drag & Drop Upload */}
      {activeMode === 'upload' && (
        <div className="space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
              {isExtractingText ? (
                <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin" />
              ) : selectedFile ? (
                <FileCheck className="w-7 h-7 text-emerald-400" />
              ) : (
                <Upload className="w-7 h-7 text-indigo-400 animate-bounce" />
              )}
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {selectedFile ? selectedFile.name : 'Drop your Resume (PDF / DOCX) here, or Browse'}
            </h3>
            <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
              Real client-side PDF text parser reads your actual resume content to generate an ATS breakdown.
            </p>
            <label className="btn-primary text-xs cursor-pointer inline-flex">
              <span>Choose Resume File</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Extraction status notification */}
          {extractionStatus && (
            <div className="p-3 bg-slate-900 border border-indigo-500/30 rounded-xl text-xs font-semibold text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{extractionStatus}</span>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Pre-loaded Sample Resumes */}
      {activeMode === 'sample' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {SAMPLE_RESUMES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="glass-card rounded-xl p-4 border border-slate-800 hover:border-indigo-500/50 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                    {sample.category}
                  </span>
                  <FileText className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors mb-1">
                  {sample.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  Includes quantified bullet points, ATS section formatting, and key tech stack.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                <span>Scan Sample</span>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mode 3: Direct Text Paste */}
      {activeMode === 'paste' && (
        <div className="space-y-3">
          <textarea
            rows={8}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your plain resume text here..."
            className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none transition-colors"
          />
        </div>
      )}

      {/* Manual Trigger Button */}
      {pastedText.trim().length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing || isExtractingText}
            className="btn-primary font-bold shadow-lg shadow-indigo-600/40"
          >
            {isAnalyzing || isExtractingText ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing ATS Factors...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run Real ATS Scan Now
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
