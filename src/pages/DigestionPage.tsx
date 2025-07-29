import React, { useState, useEffect } from 'react';
import ViewSelector from '../components/ViewSelector';
import { Camera, Check } from 'lucide-react';

interface DigestionPageProps {
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  photos: Record<string, string>; // YYYY-MM-DD -> dataURL
  setPhotos: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

// Helper to get consistent local date key YYYY-MM-DD
const getDateKey = (d: Date) => d.toLocaleDateString('sv-SE'); // sv-SE yields ISO-like 2023-09-23 in local tz

const DigestionPage: React.FC<DigestionPageProps> = ({ selectedDate, setSelectedDate, photos, setPhotos }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [viewMode,setViewMode] = useState<'single'|'grid'>('single');
  const [gridRange,setGridRange] = useState<7|30|'all'>(7);
  const photoEntriesAll = Object.entries(photos).sort((a,b)=>b[0].localeCompare(a[0]));
  const today = new Date();
  const maxDate = new Date(today.toDateString());
  const clampDate = (d:Date)=>{
    if(d>maxDate) return maxDate; return d;
  }

  // Load photos from local storage on component mount
  useEffect(() => {
    const storedPhotos = localStorage.getItem('photos');
    if (storedPhotos) {
      setPhotos(JSON.parse(storedPhotos));
    }
  }, []);

  // Save photos to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('photos', JSON.stringify(photos));
  }, [photos]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (preview) {
      const key = getDateKey(selectedDate);
      setPhotos(prev => ({ ...prev, [key]: preview }));
      setPreview(null);
      setSaved(true);
      setTimeout(()=>setSaved(false),2000);
    }
  };

  // Debugging: Log the date key and photos state
  console.log('Selected Date Key:', selectedDate.toISOString().split('T')[0]);
  console.log('Photos State:', photos);

  // Debugging: Log the image being displayed
  console.log('Displaying Image for Date:', selectedDate.toISOString().split('T')[0], 'Image:', photos[selectedDate.toISOString().split('T')[0]]);

  return (
    <div className="space-y-6">
      {saved && <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">Saved!</div>}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Digestion Tracker</h2>
        <p className="text-gray-600 mb-4">Take a belly photo each day to monitor bloating.</p>
        <div className="flex flex-col w-full items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={()=> setSelectedDate(clampDate(new Date(selectedDate.getTime()-86400000)))} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">◀</button>
            <div className="inline-flex items-center gap-1 bg-white border px-4 py-1 rounded-full shadow-sm text-gray-900 text-sm">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-calendar"><rect x="3" y="4" width="14" height="12" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="17" y2="10"></line></svg>
              {selectedDate.toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}
            </div>
            <button disabled={selectedDate>=maxDate} onClick={()=> setSelectedDate(clampDate(new Date(selectedDate.getTime()+86400000)))} className={`px-3 py-1 rounded ${selectedDate>=maxDate?'bg-gray-200 text-gray-400':'bg-gray-100 hover:bg-gray-200'}`}>▶</button>
          </div>
          <ViewSelector mode={viewMode} setMode={setViewMode} gridRange={gridRange} setGridRange={setGridRange} />
        </div>

        {viewMode==='single' && (
        <div className="flex flex-col items-center gap-4 w-full">
          {photos[getDateKey(selectedDate)] && !preview && (
            <img src={photos[getDateKey(selectedDate)]} alt="belly" className="w-full max-w-sm md:max-w-md rounded-xl border" />
          )}
          {preview && (
            <img src={preview} alt="preview" className="w-full max-w-sm md:max-w-md rounded-xl border" />
          )}
        </div>) }
        {viewMode==='grid' && (
          <div className="grid grid-cols-3 gap-4 w-full mt-6">
            {photoEntriesAll.filter(([date])=>{
              if(gridRange==='all') return true;
              const d=new Date(date);
              return (today.getTime()-d.getTime())/86400000 < gridRange;
            }).map(([date,url])=> (
              <div key={date} className="flex flex-col items-center shadow hover:shadow-lg transition-transform hover:scale-105 rounded-lg overflow-hidden">
                <img src={url} alt={date} className="w-full h-52 object-cover" />
                <span className="text-[11px] py-1 w-full text-center bg-white text-gray-700">{new Date(date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-col items-center gap-3 w-full mt-6">
          {viewMode==='single' && (
            <label className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full cursor-pointer shadow hover:shadow-lg">
              <Camera size={20} />
              <span>{photos[getDateKey(selectedDate)]? 'Replace Photo':'Take / Upload Photo'}</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
            </label>
          )}
          {preview && viewMode==='single' && (
            <button onClick={handleSave} className="flex items-center gap-1 bg-gray-900 text-white px-6 py-3 rounded-full shadow hover:shadow-lg">
              <Check size={16}/> Save
            </button>
          )}
          {photos[getDateKey(selectedDate)] && viewMode==='single' && !preview && (
            <button onClick={()=>{
              const key=getDateKey(selectedDate);
              setPhotos(prev=>{const c={...prev};delete c[key];return c;});
            }} className="bg-red-500 text-white px-6 py-3 rounded-full shadow hover:shadow-lg">Delete Photo</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigestionPage; 