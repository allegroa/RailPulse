import React from 'react';
import { useTranslation } from 'react-i18next';

export default function FiltersPanel({ filters, onFilterChange, stationsList }) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Filtri di Ricerca</h3>
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* System Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('dbViewSystem')}</label>
          <select 
            className="w-full text-sm border-slate-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            value={filters.system}
            onChange={(e) => onFilterChange('system', e.target.value)}
          >
            <option value="">{t('dbViewAll')}</option>
            <option value="RP">RP (RailPulse)</option>
            <option value="TGM">TGM</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('dbViewDate')}</label>
          <input 
            type="text" 
            placeholder="Es. 2025-05-12"
            className="w-full text-sm border-slate-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-slate-50 placeholder-slate-400"
            value={filters.date}
            onChange={(e) => onFilterChange('date', e.target.value)}
          />
        </div>

        {/* Time Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('dbViewTime')}</label>
          <input 
            type="text" 
            placeholder="Es. 10:00"
            className="w-full text-sm border-slate-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-slate-50 placeholder-slate-400"
            value={filters.time}
            onChange={(e) => onFilterChange('time', e.target.value)}
          />
        </div>

        {/* Start Station */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('dbViewStartStation')}</label>
          <input 
            type="text" 
            list="stations-list"
            placeholder={t('dbViewSearchStation')}
            className="w-full text-sm border-slate-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-slate-50 placeholder-slate-400"
            value={filters.stazionePartenza}
            onChange={(e) => onFilterChange('stazionePartenza', e.target.value)}
          />
          <datalist id="stations-list">
            {stationsList?.map((s, idx) => (
              <option key={idx} value={s.code || s.nome || ''} />
            ))}
          </datalist>
        </div>

        {/* Direction */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('dbViewDirection')}</label>
          <select 
            className="w-full text-sm border-slate-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            value={filters.direction}
            onChange={(e) => onFilterChange('direction', e.target.value)}
          >
            <option value="">{t('dbViewAll')}</option>
            <option value="Up">Up</option>
            <option value="Down">Down</option>
          </select>
        </div>

        {/* Start Km */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('dbViewStartKm')}</label>
          <input 
            type="text" 
            placeholder="Es. 10.5"
            className="w-full text-sm border-slate-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-slate-50 placeholder-slate-400"
            value={filters.startKm}
            onChange={(e) => onFilterChange('startKm', e.target.value)}
          />
        </div>

        {/* End Km */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('dbViewEndKm')}</label>
          <input 
            type="text" 
            placeholder="Es. 12.0"
            className="w-full text-sm border-slate-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-slate-50 placeholder-slate-400"
            value={filters.endKm}
            onChange={(e) => onFilterChange('endKm', e.target.value)}
          />
        </div>

        {/* Length */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('dbViewLength')}</label>
          <input 
            type="text" 
            placeholder="Es. 1.5"
            className="w-full text-sm border-slate-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-slate-50 placeholder-slate-400"
            value={filters.length}
            onChange={(e) => onFilterChange('length', e.target.value)}
          />
        </div>

      </div>
    </div>
  );
}
