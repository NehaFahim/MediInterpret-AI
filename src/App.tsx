/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  ArrowRight,
  Info,
  Stethoscope,
  Languages
} from 'lucide-react';
import { analyzeMedicalDocument, getSampleAnalysis, AnalysisResponse } from './services/gemini';

type Language = 'en' | 'ur';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadSample = () => {
    setError(null);
    setResult(getSampleAnalysis());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please upload an image file (JPEG, PNG).');
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result?.toString().split(',')[1];
        resolve(base64 || '');
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const onAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const base64 = await fileToBase64(file);
      const data = await analyzeMedicalDocument(base64, file.type);
      
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || (lang === 'en' 
        ? 'An error occurred during analysis. Please check your connection and try again.'
        : 'تجزیہ کے دوران خرابی پیش آئی۔ براہ کرم اپنا انٹرنیٹ اور سیٹنگز چیک کریں۔');
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getUrgencyStyles = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-all ${lang === 'ur' ? 'font-urdu' : 'font-sans'}`} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
              <Stethoscope size={24} />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-xl tracking-tight text-slate-900">MediInterpret<span className="text-blue-600">AI</span></h1>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">
                {lang === 'en' ? 'Secure Medical Assistance' : 'محفوظ طبی مدد'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setLang('en')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${lang === 'en' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700 font-sans'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLang('ur')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${lang === 'ur' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700 font-urdu'}`}
              >
                اردو
              </button>
            </div>
            <div className="hidden md:flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <ShieldCheck size={16} />
              <span className="text-xs font-medium">{lang === 'en' ? 'Safe' : 'محفوظ'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Upload & Instructions */}
          <div className="lg:col-span-5 space-y-8">
            <section className="space-y-4">
              <h2 className="font-display text-4xl font-bold text-slate-900 leading-[1.1]">
                {lang === 'en' ? (
                  <>Understand your <span className="text-blue-600">Medical Documents</span> with ease.</>
                ) : (
                  <>اپنی <span className="text-blue-600">طبی دستاویزات</span> کو آسانی سے سمجھیں۔</>
                )}
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                {lang === 'en' 
                  ? "Upload images of your prescriptions or lab reports. Our AI translates complex jargon into simple, everyday language."
                  : "اپنی نسخہ یا لیب رپورٹ کی تصاویر اپ لوڈ کریں۔ ہماری AI پیچیدہ طبی الفاظ کو روزمرہ کی سادہ زبان میں ترجمہ کرتی ہے۔"
                }
              </p>
            </section>

            <section className="space-y-4">
              <div 
                onClick={handleUploadClick}
                className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-8 transition-all h-64 flex flex-col items-center justify-center text-center overflow-hidden
                  ${file ? 'border-blue-400 bg-blue-50/30' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'}`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {previewUrl ? (
                  <div className="absolute inset-0 w-full h-full">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-20" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-sm border border-slate-200">
                        <FileText size={40} className="text-blue-600 mb-2 mx-auto" />
                        <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">{file?.name}</p>
                        <p className="text-xs text-slate-500">
                          {lang === 'en' ? 'Click to change file' : 'فائل تبدیل کرنے کے لیے کلک کریں'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {lang === 'en' ? 'Upload medical document' : 'طبی دستاویز اپ لوڈ کریں'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {lang === 'en' ? 'Drag & drop or click image' : 'ڈریگ اینڈ ڈراپ یا تصویر پر کلک کریں'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  disabled={!file || isAnalyzing}
                  onClick={onAnalyze}
                  className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="animate-spin" />
                      {lang === 'en' ? 'Analyzing Document...' : 'تجزیہ کیا جا رہا ہے...'}
                    </>
                  ) : (
                    <>
                      {lang === 'en' ? 'Interpret Document' : 'دستاویز کی تشریح کریں'}
                      <ArrowRight size={20} className={lang === 'ur' ? 'rotate-180' : ''} />
                    </>
                  )}
                </button>
                
                {file && !isAnalyzing && (
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                      setResult(null);
                      setError(null);
                    }}
                    className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all border border-slate-200"
                    title={lang === 'en' ? 'Clear' : 'صاف کریں'}
                  >
                    <Activity size={20} />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-slate-500 font-medium">
                  {lang === 'en' ? 'Want to test the interpreter right now?' : 'کیا آپ ابھی ٹیسٹ کرنا چاہتے ہیں؟'}
                </span>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 shadow-xs"
                >
                  <FileText size={14} />
                  {lang === 'en' ? 'Try Sample Report' : 'نمونہ رپورٹ دیکھیں'}
                </button>
              </div>

              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 flex gap-3">
                <Info size={18} className="text-slate-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 italic leading-relaxed">
                  {lang === 'en' 
                    ? "Your privacy is our priority. We only use your upload for real-time analysis and do not store sensitive medical images permanently."
                    : "آپ کی رازداری ہماری ترجیح ہے۔ ہم آپ کی اپ لوڈ کردہ تصویر کو صرف ریئل ٹائم تجزیہ کے لیے استعمال کرتے ہیں اور حساس طبی تصاویر کو مستقل طور پر محفوظ نہیں کرتے۔"
                  }
                </p>
              </div>
            </section>
          </div>

          {/* Right Column: Analysis Result */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-red-50 border border-red-200 p-6 rounded-3xl flex gap-4"
                >
                  <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={24} />
                  <div className="flex-1">
                    <h3 className="font-bold text-red-900 mb-1">{lang === 'en' ? 'Analysis Error' : 'تجزیہ میں غلطی'}</h3>
                    <p className={`text-red-700 text-sm leading-relaxed ${lang === 'ur' ? 'font-urdu' : ''}`}>{error}</p>
                    
                    {(error.toLowerCase().includes('suspended') || error.toLowerCase().includes('api key') || error.toLowerCase().includes('permission denied')) && (
                      <div className="mt-3 bg-white/80 p-3.5 rounded-xl border border-red-200 text-xs text-slate-700 space-y-1.5">
                        <p className="font-bold text-slate-900">
                          {lang === 'en' ? '🔑 How to fix this:' : '🔑 اس مسئلے کا حل:'}
                        </p>
                        <p className={lang === 'ur' ? 'font-urdu leading-relaxed' : ''}>
                          {lang === 'en' 
                            ? 'This API key has been suspended by Google Cloud. Please generate a new key from Google AI Studio and configure GEMINI_API_KEY.'
                            : 'یہ اے پی آئی کی گوگل کلاؤڈ کی طرف سے معطل ہو چکی ہے۔ برائے مہربانی Google AI Studio سے نئی کی حاصل کریں اور GEMINI_API_KEY سیٹ کریں۔'
                          }
                        </p>
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <a 
                            href="https://aistudio.google.com/apikey" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold underline"
                          >
                            Google AI Studio API Keys →
                          </a>
                          <button
                            type="button"
                            onClick={handleLoadSample}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                          >
                            <FileText size={13} />
                            {lang === 'en' ? 'Preview Sample Report' : 'نمونہ رپورٹ دیکھیں'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {!isAnalyzing && !result && !error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-slate-50/50"
                >
                  <Activity size={48} className="text-slate-300 mb-4" />
                  <p className="text-slate-400 font-medium mb-3">
                    {lang === 'en' ? 'Upload a document to see the analysis appear here.' : 'یہاں تجزیہ دیکھنے کے لیے دستاویز اپ لوڈ کریں۔'}
                  </p>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-all hover:border-slate-300"
                  >
                    <FileText size={14} className="text-blue-600" />
                    {lang === 'en' ? 'Or preview sample report output' : 'یا نمونہ رپورٹ کا رزلٹ دیکھیں'}
                  </button>
                </motion.div>
              )}

              {isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 space-y-6"
                >
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <Activity className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={32} />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-display font-bold text-xl">
                      {lang === 'en' ? 'AI is processing...' : 'AI پروسیسنگ کر رہا ہے...'}
                    </h3>
                    <p className="text-slate-500 text-sm animate-pulse">
                      {lang === 'en' ? 'Reading medical terms and translating for you.' : 'طبی اصطلاحات کو پڑھا جا رہا ہے اور آپ کے لیے ترجمہ کیا جا رہا ہے۔'}
                    </p>
                  </div>
                </motion.div>
              )}

              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {result.isSimulated && (
                    <div className="bg-blue-50/80 border border-blue-200/80 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs text-blue-900 shadow-xs">
                      <Info size={18} className="text-blue-600 shrink-0" />
                      <span className={lang === 'ur' ? 'font-urdu leading-relaxed' : 'font-medium'}>
                        {lang === 'en'
                          ? 'Preview Mode: Safe educational interpretation is active. When running locally with your GEMINI_API_KEY in .env, live Gemini AI Vision runs in real-time.'
                          : 'پیش نظارہ موڈ: تعلیمی تشریح فعال ہے۔ جب آپ اپنے کمپیوٹر پر .env فائل میں GEMINI_API_KEY سیٹ کریں گے تو لائیو AI خودکار طور پر فعال ہو جائے گی۔'}
                      </span>
                    </div>
                  )}

                  {/* Status Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="text-emerald-500" size={20} />
                          <h3 className="font-display font-bold text-lg text-slate-900">
                            {lang === 'en' ? 'Analysis Complete' : 'تجزیہ مکمل ہو گیا'}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">{result.documentType}</p>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getUrgencyStyles(result.urgencyLevel)}`}>
                        {lang === 'en' ? 'Urgency' : 'فوری ضرورت'}: {result.urgencyLevel}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                      <h4 className="text-xs uppercase tracking-widest font-bold text-blue-800 mb-2">
                        {lang === 'en' ? 'Patient Summary' : 'مریض کا خلاصہ'}
                      </h4>
                      <p className={`text-slate-800 leading-relaxed font-medium ${lang === 'ur' ? 'font-urdu' : ''}`}>
                        {result.patientSummary[lang] || result.patientSummary['en']}
                      </p>
                    </div>
                  </div>

                  {/* Findings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.analysis.map((item, idx) => {
                      const content = item[lang] || item['en'] || {};
                      return (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors"
                        >
                          <h4 className="font-bold text-slate-900 mb-1">{item.term || item.medicineName}</h4>
                          <p className={`text-sm text-slate-600 mb-3 ${lang === 'ur' ? 'font-urdu leading-loose' : 'font-sans'}`}>
                            {content.simpleExplanation || content.purpose || '...'}
                          </p>
                          
                          {(item.dosage || item.timing) && (
                            <div className="flex gap-2 flex-wrap">
                              {item.dosage && <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 truncate">{item.dosage}</span>}
                              {item.timing && <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 truncate">{item.timing}</span>}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Key Highlights */}
                  <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-200">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-4">
                      {lang === 'en' ? 'Key Highlights' : 'اہم نکات'}
                    </h4>
                    <ul className="space-y-3">
                      {result.keyFindings.map((finding, idx) => (
                        <li key={idx} className={`flex gap-3 text-sm leading-relaxed text-slate-200 ${lang === 'ur' ? 'font-urdu' : ''}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                          {finding[lang] || finding['en']}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Disclaimer Card */}
                  <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                    <AlertCircle className="text-amber-600 shrink-0" size={24} />
                    <p className={`text-xs text-amber-800 leading-relaxed italic ${lang === 'ur' ? 'font-urdu' : ''}`}>
                      {result.disclaimer[lang] || result.disclaimer['en']}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Persistent Footer Disclaimer */}
      <footer className="mt-auto py-12 px-4 border-t border-slate-200 bg-white text-center sm:text-left">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-md space-y-4">
             <div className="flex items-center gap-2 opacity-50 grayscale justify-center sm:justify-start">
              <Stethoscope size={20} />
              <span className="font-display font-bold text-lg tracking-tight">MediInterpretAI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed uppercase tracking-tighter">
              AI-driven medical document simplification service. This application uses Google Gemini to interpret medical documents.
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 max-w-sm mx-auto sm:mx-0">
            <h4 className="text-xs uppercase font-bold text-slate-900 mb-2">Notice & Safety</h4>
            <p className="text-[10px] uppercase font-bold text-slate-400 leading-relaxed mb-1">
              THIS IS NOT MEDICAL ADVICE.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our AI interpretations are for informational purposes to help you understand medical language. Always verify results with a medical professional.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

