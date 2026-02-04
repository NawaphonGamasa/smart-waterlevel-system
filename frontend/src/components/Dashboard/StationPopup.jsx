import React from 'react';
import { AlertTriangle, CheckCircle, Activity, Clock } from 'lucide-react';
import CCTVPlayer from '../Video/CCTVPlayer';

const StationPopup = ({ data }) => {
  // data = { name, status, val, lastUpdate, camUrl, id }

  const isNormal = data.status === 'normal' || data.status === 'run';
  const statusColor = isNormal ? 'text-green-400' : 'text-red-500';
  const borderColor = isNormal ? 'border-green-500/50' : 'border-red-500/50';
  const StatusIcon = isNormal ? CheckCircle : AlertTriangle;

  // แปลงเวลาให้สวยงาม
  const formattedTime = data.lastUpdate 
    ? new Date(data.lastUpdate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second:'2-digit' })
    : '--:--:--';

  return (
    <div className={`w-96 bg-gray-900/95 backdrop-blur-xl text-white rounded-xl border ${borderColor} shadow-2xl overflow-hidden font-sans select-none`}>
      
      {/* Header */}
      <div className="bg-gray-800/80 p-3 flex justify-between items-center border-b border-gray-700">
        <h3 className="text-base font-bold flex items-center gap-2 text-gray-100">
          <Activity size={18} className="text-blue-400" />
          {data.name}
        </h3>
        <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${statusColor} bg-black/40 px-2 py-1 rounded-full border border-white/5`}>
          <StatusIcon size={12} />
          <span>{isNormal ? 'NORMAL' : 'ALERT'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-5">
        
        {/* Value Section */}
        <div className="flex justify-between items-end pb-2 border-b border-gray-700/50">
          <div>
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">Water Level</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-5xl font-black ${isNormal ? 'text-blue-400' : 'text-red-500'}`}>
                {data.val.toFixed(1)}
              </span>
              <span className="text-lg text-gray-500 font-medium">%</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-gray-500 mb-1">
              <Clock size={10} />
              <span className="text-[10px] font-bold uppercase">Last Update</span>
            </div>
            <p className="text-sm font-mono text-gray-300 bg-gray-800 px-2 py-0.5 rounded inline-block">
              {formattedTime}
            </p>
          </div>
        </div>

        {/* CCTV Section (เรียกใช้ Component แยก) */}
        <div>
           <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-2">Live Monitoring</p>
           <CCTVPlayer url={data.camUrl} label={`CAM 0${data.id}`} />
        </div>
        
      </div>
    </div>
  );
};

export default StationPopup;