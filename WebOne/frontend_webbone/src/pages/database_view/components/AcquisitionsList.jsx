import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AcquisitionsList({ groups }) {
  const { t } = useTranslation();

  if (!groups || groups.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center text-slate-500">
        {t('dbViewNoAcquisitions')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group, index) => {
        const firstAcq = group[0];
        const groupTitle = `${firstAcq.stazionePartenza || 'Sconosciuta'} - ${firstAcq.direction || 'Sconosciuta'}`;

        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Group Header */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Tratta: {groupTitle}</h3>
                <p className="text-xs text-slate-500">{group.length} {t('dbViewCommonTrack')}</p>
              </div>
              <button className="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded transition-colors font-medium">
                {t('dbViewGroupAction')}
              </button>
            </div>

            {/* Group Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2 font-medium">{t('dbViewSystem')}</th>
                    <th className="px-4 py-2 font-medium">{t('dbViewDate')}</th>
                    <th className="px-4 py-2 font-medium">{t('dbViewTime')}</th>
                    <th className="px-4 py-2 font-medium">Km (Inizio-Fine)</th>
                    <th className="px-4 py-2 font-medium text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {group.map(acq => (
                    <tr key={acq.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0">
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          acq.system === 'RP' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {acq.system}
                        </span>
                      </td>
                      <td className="px-4 py-2">{acq.date}</td>
                      <td className="px-4 py-2">{acq.time}</td>
                      <td className="px-4 py-2 text-slate-500">{acq.startKm} - {acq.endKm}</td>
                      <td className="px-4 py-2 text-right">
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-xs mr-2">{t('dbViewDetails')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
