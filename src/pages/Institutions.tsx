import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  Plus,
  Upload,
  Download,
  Filter,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  X
} from 'lucide-react';
import { api } from '../services/api.js';
import { Institution } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

export const Institutions: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // CSV Import Modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadInstitutions();
  }, []);

  async function loadInstitutions() {
    setLoading(true);
    try {
      const res = await api.getInstitutions({
        state: stateFilter || undefined,
        type: typeFilter || undefined,
        search: search || undefined
      });
      setInstitutions(res.institutions);
    } catch (err) {
      console.error('Failed to load institutions:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCsvParse = (text: string) => {
    setCsvText(text);
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      setParsedRows([]);
      setImportErrors(['CSV must have a header line and at least one data row.']);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      const rowObj: any = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || '';
      });

      if (!rowObj.officialId || !rowObj.name || !rowObj.state || !rowObj.district) {
        errors.push(`Row ${i} missing required columns (officialId, name, state, district).`);
      } else {
        rows.push(rowObj);
      }
    }

    setParsedRows(rows);
    setImportErrors(errors);
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setImporting(true);
    try {
      const res = await api.importInstitutions(parsedRows);
      alert(`Successfully imported ${res.importedCount} institutions! (${res.errorCount} skipped)`);
      setImportModalOpen(false);
      setCsvText('');
      setParsedRows([]);
      await loadInstitutions();
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const sampleCsv = `officialId,name,state,district,institutionType,sourceName
1-99882211,National Institute of Technology Raipur,Chhattisgarh,Raipur,Engineering & Technology,AICTE Public 2026
1-99882212,Government Engineering College Thrissur,Kerala,Thrissur,Engineering & Technology,AICTE Public 2026
1-99882213,Goa College of Pharmacy,Goa,Panaji,Pharmacy,AICTE Public 2026`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutions Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Verified public registry of AICTE approved colleges, universities, and polytechnics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCsvText(sampleCsv);
              handleCsvParse(sampleCsv);
              setImportModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Upload size={13} className="text-slate-500" />
            Import CSV Public Records
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Institution Name or AICTE Official ID (e.g. 1-10928374)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadInstitutions()}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-md border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Filter by State (e.g. Delhi, Maharashtra)..."
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadInstitutions()}
              className="w-full text-xs py-2 px-3 rounded-md border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadInstitutions}
              className="flex-1 py-2 px-3 text-xs font-semibold bg-slate-800 text-white rounded-md hover:bg-slate-900 transition-colors"
            >
              Search Directory
            </button>
            <button
              onClick={() => {
                setSearch('');
                setStateFilter('');
                setTypeFilter('');
                setTimeout(loadInstitutions, 50);
              }}
              className="py-2 px-3 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
            Loading institutions directory...
          </div>
        ) : institutions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No institutions match your search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Official AICTE ID</th>
                  <th className="py-3 px-4">Institution Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">State & District</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Source Snapshot</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {institutions.map(inst => (
                  <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      {inst.officialId}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{inst.name}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-sm">{inst.address}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {inst.institutionType}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {inst.district}, {inst.state}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-medium text-slate-800">{inst.headOfInstitution || 'Director'}</p>
                      <p className="text-[11px] text-slate-400">{inst.contactEmail || inst.contactPhone}</p>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                      {inst.sourceName}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/applications?search=${encodeURIComponent(inst.name)}`)}
                        className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 rounded transition-colors inline-flex items-center gap-1"
                      >
                        Applications <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CSV IMPORT MODAL */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Import Public AICTE Institution Records</h3>
              <button onClick={() => setImportModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Paste CSV data with columns: <span className="font-mono font-semibold">officialId,name,state,district,institutionType,sourceName</span>
              </p>
              <textarea
                rows={6}
                value={csvText}
                onChange={e => handleCsvParse(e.target.value)}
                className="w-full font-mono text-[11px] p-3 border border-slate-200 rounded-md focus:outline-hidden"
              />

              {importErrors.length > 0 && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                  <span className="font-bold">Validation Warnings:</span>
                  {importErrors.map((err, i) => (
                    <p key={i} className="text-[11px]">{err}</p>
                  ))}
                </div>
              )}

              {parsedRows.length > 0 && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <span className="font-bold">{parsedRows.length} valid rows ready for import.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importing || parsedRows.length === 0}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {importing ? 'Importing Records...' : `Confirm Import (${parsedRows.length} Records)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
