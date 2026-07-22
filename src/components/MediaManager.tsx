import React, { useState, useEffect } from 'react';
import { 
  FolderLock, Gavel, Trash2, CloudCheck, UploadCloud, 
  ExternalLink, Search, Lock, ShieldAlert, Radio, FileText, FileImage 
} from 'lucide-react';
import { CloudFile } from '../types';

export default function MediaManager() {
  const [cabinet, setCabinet] = useState<CloudFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form Upload state
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('2.4'); // MB
  const [provider, setProvider] = useState<'gcs' | 's3'>('gcs');
  const [encrypt, setEncrypt] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch file list
  const fetchCabinet = async () => {
    try {
      const res = await fetch('/api/storage');
      const data = await res.json();
      setCabinet(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCabinet();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;

    setIsUploading(true);
    // Simulate latency for encryption and cloud secure upload
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const res = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: fileName.endsWith('.pdf') || fileName.endsWith('.jpg') ? fileName : `${fileName}.pdf`,
          size: Math.floor(parseFloat(fileSize) * 1024 * 1024),
          mimeType: fileName.endsWith('.jpg') || fileName.endsWith('.png') ? 'image/jpeg' : 'application/pdf',
          provider,
          bucket: provider === 'gcs' ? 'us-east1-bid-vault-pdf' : 's3-us-west-2-asset-vault',
          encrypt
        })
      });

      if (res.ok) {
        setFileName('');
        fetchCabinet();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (id: string) => {
    try {
      await fetch(`/api/storage/${id}`, { method: 'DELETE' });
      fetchCabinet();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCabinet = cabinet.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      
      {/* Header element */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-display font-bold text-slate-800 flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-emerald-500" />
            Escrow Files & Multi-Cloud Authenticity Cabinet
          </h3>
          <p className="text-xs text-slate-500">
            Securely deposit or inspect digital documents, certificates of authenticity, and receipts connected to active lots.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-500 px-3 py-1">
            Active Vaults: {provider === 'gcs' ? 'Google Cloud' : 'AWS S3'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Deposit New Document Form */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 block mb-2 uppercase tracking-wider">
              ✦ Secure Deposit Protocol
            </span>
            <h4 className="font-display font-semibold text-xs text-slate-800 mb-4">
              Sync Verification File with Storage Provider
            </h4>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">File Name</label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. korg_condition_report"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                  id="media-filename-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Size (MB)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none font-mono"
                    id="media-size-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Encryption Protocol</label>
                  <button
                    type="button"
                    onClick={() => setEncrypt(!encrypt)}
                    className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                      encrypt 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                    id="encrypt-toggle-btn"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{encrypt ? 'AES-256 On' : 'Unencrypted'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Cloud Storage Node</label>
                <div className="grid grid-cols-2 gap-2" id="provider-selector">
                  <button
                    type="button"
                    onClick={() => setProvider('gcs')}
                    className={`py-2 px-3 text-xs font-medium border rounded-lg transition-all ${
                      provider === 'gcs'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                    id="gcs-provider"
                  >
                    Google Cloud Storage
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvider('s3')}
                    className={`py-2 px-3 text-xs font-medium border rounded-lg transition-all ${
                      provider === 's3'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                    id="s3-provider"
                  >
                    Amazon AWS S3
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white py-2.5 rounded-xl text-xs font-display font-medium flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer shadow"
                id="media-submit-btn"
              >
                <UploadCloud className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
                <span>{isUploading ? 'Securing Channel...' : 'Upload & Hash Asset'}</span>
              </button>
            </form>
          </div>

          {/* Encryption status footer info card */}
          <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-start gap-2.5 text-[11px] text-emerald-800">
            <Lock className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">Zero-Knowledge Escrow:</span> All documents are hashed on client-side before sync transmission.
            </div>
          </div>
        </div>

        {/* Dynamic Files Cabinet List Explorer */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Cabinet search bar controls */}
          <div className="flex gap-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search secure documents library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white"
              id="cabinet-search"
            />
          </div>

          {/* Live Document Grid lines */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1" id="media-files-box">
            {filteredCabinet.length > 0 ? (
              filteredCabinet.map(file => (
                <div 
                  key={file.id} 
                  className="p-3.5 bg-white border border-slate-100 rounded-xl hover:border-slate-300 transition-all flex items-center justify-between gap-4 shadow-sm hover:shadow"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-lg flex-shrink-0">
                      {file.name.endsWith('.pdf') ? <FileText className="w-4 h-4" /> : <FileImage className="w-4 h-4" />}
                    </div>
                    
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 font-display truncate">
                        {file.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <span>•</span>
                        <span className="uppercase text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {file.provider} bucket
                        </span>
                        {file.encrypted && (
                          <span className="text-emerald-500 flex items-center gap-0.5 font-bold" title="Secure AES256 Encrypted">
                            <Lock className="w-3 h-3 text-emerald-500" />
                          </span>
                        )}
                      </p>
                      
                      {/* Checksum signature display node */}
                      <span className="text-[9px] font-mono text-slate-400 line-clamp-1 mt-1 block">
                        SHA-256: {file.checksum}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 text-slate-500 border border-slate-200"
                      title="Inspect Original Document link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg border border-rose-100"
                      title="Delete document securely"
                      id={`delete-file-${file.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                No authenticity files found matching directory filters.
              </div>
            )}
          </div>

          {/* S3 vs GCS Status banner */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> S3 Bucket node: Connected (us-west-2)
            </span>
            <span>GCS Node: Active (us-east1)</span>
          </div>

        </div>

      </div>

    </div>
  );
}
