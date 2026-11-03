'use strict';
// Dates, scope, targets and reviews are generated from the approved Vault curriculum.
const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),VAULT=path.resolve(ROOT,'../..'),notes=path.resolve(ROOT,'..');
const text=fs.readFileSync(path.join(notes,'NOV17_STUDY_CURRICULUM.md'),'utf8'),reviewText=fs.readFileSync(path.join(notes,'NOV17_REVIEW_SCHEDULE.md'),'utf8');
const clean=s=>s.replace(/\*\*/g,'').replace(/`/g,'').trim();
const reviews=Object.fromEntries(reviewText.split('\n').filter(l=>/^\| 11\/\d+/.test(l)).map(l=>{const c=l.split('|').slice(1,-1).map(clean);return [Number(c[0].split('/')[1]),c[1]];}));
const llm='1. llm_hands_on-main/llm_hands_on-main/',vision='2. vision/AI_Specialist_Vision/',device='3. On-Device AI/On-Device AI 강의자료/실습/',data='4. Data model 의 이해/20260114/',rag1='5. LLM Application/1일차/실습 자료/Code/',rag2='5. LLM Application/2일차/십습자료/Code/';
const files={
 4:['Chapter_1_Exercise_Vector Space.ipynb','Chapter_2_Exercise_Dataset.ipynb','Chapter_3_Excercise_Attention.ipynb','Chapter_3_Excercise_Viz_Multi_head_attention.ipynb'].map(n=>llm+n),
 5:['Chapter_4_Excercise_GPT.ipynb','Chapter_5_Excercise_Pretraining.ipynb','llm_from_scratch/Chapter_5_Excercise_Pretraining_Cross_Entropy.ipynb'].map(n=>llm+n),
 6:['Chapter_6_Excercise_Finetuning_Classification.ipynb','Chapter_6_Excercise_Finetuning_Classification_LoRA.ipynb','Chapter_7_Exercise_Follow_Instructions.ipynb','Chapter_7_Exercise_Follow_Instructions_dpo.ipynb'].map(n=>llm+n),
 7:[data+'3_4-ts-practice/ts_practice.ipynb'],
 8:['RecSys_NCF.ipynb','RecSys_GCF_practice.ipynb'].map(n=>data+'7_8-recsys-practice/'+n),
 9:['01_ResNet18_CIFAR10.ipynb','02_ViT_CIFAR10.ipynb'].map(n=>vision+n),
 10:['03_DETR.ipynb','04_Unet.ipynb','05_DDPM.ipynb','06_Stable_Diffusion_v1_4.ipynb'].map(n=>vision+n),
 11:['1. Pruning for CNN.ipynb','2. Quantization for CNN.ipynb','3. Knowledge Distillation.ipynb','4. Pruning for LLM.ipynb','5. Quantization for LLM.ipynb'].map(n=>device+n),
 12:['1. Llama_index.ipynb','2. RAG.ipynb'].map(n=>rag1+n),
 13:['1. Data_preprocessing.ipynb','2. Task_1.ipynb','3. Task_2.ipynb','4_RAG_framework_evaluation_with_MCP.ipynb'].map(n=>rag2+n),
};
const subjects={4:'LLM',5:'LLM',6:'LLM',7:'Data',8:'Data',9:'Vision',10:'Vision',11:'On-device',12:'RAG',13:'RAG',14:'기출 복원',15:'혼합 평가',16:'오답 재시험',17:'시험 전'};
const shortTitles={4:'Dataset에서 Attention까지',5:'GPT 조립·생성·학습',6:'분류·LoRA·Instruction·DPO',7:'시계열 입력부터 미래 예측까지',8:'NCF·NGCF 추천 모델',9:'ResNet18·ViT',10:'DETR·U-Net·Diffusion',11:'Pruning·Quantization·Distillation',12:'LlamaIndex·Custom RAG',13:'Web·KG·MCP Agent',14:'10월 실제 기출 61칸',15:'5과목 3시간 실전 풀이',16:'틀린 문제만 다시 풀기',17:'오답 한 장 최종 확인'};
const priority={4:'Ch1과 Viz는 짧게 확인하고 Ch2·Ch3 구현에 집중.',6:'DPO·LoRA를 우선하되 분류·SFT를 생략하지 않기.',10:'새 학습 시간 약 2/3는 DETR·U-Net, 약 1/3는 DDPM·Stable Diffusion.',11:'이미 공부한 On-device 압축 복습. CNN 3주제를 우선 구현하고 LLM 2주제의 대표 식도 확인.',13:'Data preprocessing은 필드·입력 구성만 짧게 보고 Task 1·2와 MCP에 집중. 미확인 범위 확정.',15:'기출 주제 참고와 실제 복원·변형을 구분. 3시간 연속 시간을 확보하고 채점·분석은 다음 날.',16:'새 대단원 학습은 하지 않기. 확신했지만 틀린 항목부터 재시험.',17:'새 문제·새 개념·밤샘 없이 개인 오답만 확인.'};
const slugs={LLM:'llm',Data:'data',Vision:'vision','On-device':'on-device',RAG:'rag'};
const days=text.split('\n').filter(l=>/^\| 11\/\d+/.test(l)).map(line=>{
 const c=line.split('|').slice(1,-1).map(clean),n=Number(c[0].match(/^11\/(\d+)/)[1]),phase=n<=13?'learn':n<=16?'practice':'exam',date='2026-11-'+String(n).padStart(2,'0');
 const links=phase==='learn'?[{href:'../'+slugs[subjects[n]]+'/',label:subjects[n]+' 과목 학습 열기'}]:n===14?[{href:'../exam-recall-october/',label:'10월 실제 기출 풀기'}]:n===15?[{href:'../mock-exam-1/',label:'보조 혼합 모의 1회 · 예상·변형'},{href:'../exam-recall-october/',label:'10월 실제 기출'}]:n===16?[{href:'../exam-recall-october/',label:'10월 기출 오답 이력 보기'}]:[{href:'../',label:'전체 과목 홈'}];
 return {date,phase,subject:subjects[n],title:shortTitles[n],minutes:n===17?30:Number(c[1].match(/\d+/)[0]),timeLabel:n===17?'20~30분':(Number(c[1].match(/\d+/)[0])/60)+'시간',range:c[2],target:c[3],completion:phase==='learn'?c[4]:n===14?'풀이·채점을 마치고 미완료와 오답을 기록':n===15?'자료 없이 3시간 풀이 완료. 분석은 11/16에 진행':n===16?'오답을 답 가리고 재작성하고 마지막 체크 완료':'개인 오답만 확인하고 시험 준비',review:reviews[n],notebooks:files[n]||[],links,priority:priority[n]||''};
});
if(days.length!==14)throw new Error('Curriculum must contain 14 date rows');
for(const d of days){if(!d.review)throw new Error('Missing review '+d.date);for(const f of d.notebooks)if(!fs.existsSync(path.join(VAULT,f)))throw new Error('Missing notebook '+f);}
const out=path.join(ROOT,'study-plan');fs.mkdirSync(out,{recursive:true});
const plan={examDate:'2026-11-17',startDate:'2026-11-04',firstPassEnd:'2026-11-13',source:'NOV17_STUDY_CURRICULUM.md + NOV17_REVIEW_SCHEDULE.md',days};
fs.writeFileSync(path.join(out,'plan-data.js'),'// Generated from the approved Vault curriculum by tools/build-study-plan.cjs\nwindow.STUDY_PLAN = '+JSON.stringify(plan,null,2)+';\n');
console.log('Built study plan: 14 dates, 31 source notebooks.');
