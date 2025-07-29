import { DailyRecord } from './storage';

export const computeKPIs = (records: Record<string, DailyRecord>) => {
  const values = Object.values(records);
  const tracked = values.filter(r=>r.sleepSaved||r.mealsSaved||r.sportSaved||r.cycleSaved||r.symptomsSaved);
  const daysTracked = tracked.length;

  const sleepArr = tracked.filter(r=>r.sleepSaved && r.sleepHours!==null).map(r=>r.sleepHours as number);
  const avgSleep = sleepArr.length ? sleepArr.reduce((a,b)=>a+b,0)/sleepArr.length : 0;

  const sportArr = tracked.filter(r=>r.sportSaved && r.sportData).map(r=>{
    const mins = Object.values(r.sportData!.durations||{}).reduce((a,b)=>a+(b||0),0);
    return mins;
  });
  const avgSportMin = sportArr.length ? sportArr.reduce((a,b)=>a+b,0)/sportArr.length : 0;

  const symptomCount = tracked.reduce((acc,r)=>acc + (r.symptomsSaved ? r.symptoms.length : 0),0);
  const avgSymptoms = tracked.length? symptomCount/tracked.length : 0;

  return { daysTracked, avgSleep, avgSportMin, avgSymptoms };
};

export const rollingSleepSport = (records: Record<string, DailyRecord>, days=7)=>{
  const keys = Object.keys(records).sort();
  const last = keys.slice(-days);
  const sleep: number[]=[]; const sport:number[]=[];
  last.forEach(k=>{
    const r=records[k];
    sleep.push(r.sleepHours??0);
    const mins = r.sportData? Object.values(r.sportData.durations||{}).reduce((a,b)=>a+(b||0),0):0;
    sport.push(mins);
  });
  return {sleep, sport, labels:last};
};

export const topFoods = (records: Record<string, DailyRecord>, top=10)=>{
  const counts: Record<string, number>={};
  Object.values(records).forEach(r=>{
    const meals=[r.meals.morning,r.meals.afternoon,r.meals.evening,r.meals.snack];
    meals.forEach(str=> str.split(',').filter(Boolean).forEach(f=>{
      if(f==='Fasting') return;
      counts[f]= (counts[f]||0)+1;
    }));
  });
  return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,top);
};

export const avgDailyProgress = (records: Record<string,DailyRecord>)=>{
  const vals = Object.values(records).map(r=>r.progress??0);
  const avg = vals.length? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
  return avg;
};

export const sleepSymptomLink = (records:Record<string,DailyRecord>)=>{
  const buckets={short:{h:'<6h',sym:0,days:0},mid:{h:'6-8h',sym:0,days:0},long:{h:'>8h',sym:0,days:0}} as any;
  Object.values(records).forEach(r=>{
    if(r.sleepHours===null) return;
    const bucket = r.sleepHours<6? 'short': r.sleepHours<=8 ?'mid':'long';
    buckets[bucket].days+=1;
    buckets[bucket].sym+= r.symptoms.length;
  });
  return buckets;
};

export const symptomsTrend = (records: Record<string,DailyRecord>)=>{
  const keys=Object.keys(records).sort();
  const counts=keys.map(k=> records[k].symptomsSaved? records[k].symptoms.length:0);
  return {labels: keys, counts};
};

export const issuesTrend = (records:Record<string,DailyRecord>)=>{
  const keys=Object.keys(records).sort();
  const counts=keys.map(k=>{
    const r=records[k];
    return r.symptomsSaved && r.symptoms.includes('Digestive Issues') ? 1 : 0;
  });
  return {labels:keys, counts};
};

export const rollingIssuesAvg = (records:Record<string,DailyRecord>, window=7)=>{
  const keys=Object.keys(records).sort();
  const raw=keys.map(k=>{
    const r=records[k];
    return r.symptomsSaved && r.symptoms.includes('Digestive Issues')?1:0;
  });
  const avg:number[]=[];
  for(let i=0;i<raw.length;i++){
    const slice=raw.slice(Math.max(0,i-window+1),i+1);
    avg.push( slice.reduce((a:number,b:number)=>a+b,0)/slice.length );
  }
  return {labels:keys, avg};
};

export const symptomMonthlyRecurrence = (records: Record<string,DailyRecord>, symptom: string)=>{
  const months: Record<string, number> = {}; // YYYY-MM -> count
  Object.entries(records).forEach(([date, rec])=>{
    if(rec.symptomsSaved && rec.symptoms.includes(symptom)){
      const ym = date.slice(0,7);
      months[ym] = (months[ym]||0)+1;
    }
  });
  const labels = Object.keys(months).sort();
  const counts = labels.map(l=> months[l]);
  return {labels, counts};
}; 