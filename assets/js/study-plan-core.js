(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.StudyPlanCore=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 function dateKey(date=new Date()){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date),get=t=>parts.find(p=>p.type===t).value;return `${get('year')}-${get('month')}-${get('day')}`;}
 function daysUntil(today,exam){return Math.round((Date.parse(exam+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000);}
 function normalize(raw,days){const data=raw?.completed;if(!data||typeof data!=='object'||Array.isArray(data))return {};const result={};for(const day of days)if(data[day.date]===true)result[day.date]=true;return result;}
 function stats(days,completed){const result={done:0,total:days.length,percent:0,learn:0,practice:0,exam:0};for(const day of days)if(completed[day.date]===true){result.done++;result[day.phase]++;}result.percent=result.total?Math.round(result.done/result.total*100):0;return result;}
 function status(date,today,completed){return completed?'done':date===today?'today':date<today?'overdue':'upcoming';}
 return Object.freeze({dateKey,daysUntil,normalize,stats,status});
});
