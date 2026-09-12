"""Build full-scope implementation questions from the existing verified source cells."""
import ast
import json
import re
import subprocess
import io
import tokenize
from pathlib import Path

ROOT = Path(__file__).resolve().parent
script = '''global.window={};require('./course_data.js');
const original=JSON.parse(JSON.stringify(window.LLM_COURSE.cells));
require('./exam_overrides.js');
console.log(JSON.stringify({original,course:window.LLM_COURSE}));'''
data = json.loads(subprocess.check_output(['node', '-e', script], cwd=ROOT, encoding='utf-8'))

# Additional reported exam topics: preserve the actual source class and comments.
notebook_dir = ROOT.parents[2] / '1. llm_hands_on-main' / 'llm_hands_on-main' / 'llm_from_scratch'
for path in notebook_dir.glob('Chapter_3_Attention_Mechanisms_KR.ipynb'):
    for i, cell in enumerate(json.loads(path.read_text(encoding='utf-8'))['cells']):
        source = ''.join(cell.get('source', []))
        if cell.get('cell_type') == 'code' and 'class MultiHeadAttention(' in source:
            data['original'][f'ch3-full-mha-{i}'] = {'source': source}

extras = []
specs = [
 ('llm-04','TransformerBlock',['self.att'], 'Attention 생성자 구성', 'cfg를 사용해 입력·출력 D를 유지하는 MultiHeadAttention을 생성하세요.'),
 ('llm-04','GPTModel',['self.tok_emb','self.pos_emb','self.drop_emb'], 'GPT 입력부 생성', 'token·position embedding과 embedding dropout을 생성하세요.'),
 ('llm-03a','MultiHeadAttention',['keys','values','queries'], 'Multi-Head 분할', 'Q/K/V를 [B,T,H,Dh]로 분할하는 세 줄을 작성하세요.', 'view'),
 ('llm-03a','MultiHeadAttention',['keys','queries','values'], 'Multi-Head 축 이동', 'head별 병렬 연산을 위해 [B,H,T,Dh]로 축을 이동하세요.', 'transpose'),
 ('llm-03a','MultiHeadAttention',['attn_scores','attn_weights'], 'Head별 score와 정규화', 'head별 Q·K 점수와 sqrt(Dh) 스케일 softmax를 구현하세요.', 'score'),
 ('llm-03a','MultiHeadAttention',['context_vec'], 'Head 결합과 출력', 'Value 가중합부터 head 결합·출력 projection까지 구현하세요.'),
]
for j, spec in enumerate(specs):
    chapter_id, cls_name, targets, topic, prompt, *mode = spec
    found = None
    for key, cell in data['original'].items():
        try:
            tree = ast.parse(cell['source'])
        except SyntaxError:
            continue
        cls = next((n for n in tree.body if isinstance(n, ast.ClassDef) and n.name == cls_name), None)
        if cls is None:
            continue
        nodes = []
        for n in ast.walk(cls):
            if not isinstance(n, ast.Assign) or ast.unparse(n.targets[0]) not in targets:
                continue
            expr = ast.unparse(n.value)
            if mode and mode[0] in ('view','transpose') and f'.{mode[0]}(' not in expr:
                continue
            if mode and mode[0] == 'score' and not (' @ ' in expr or 'softmax(' in expr):
                continue
            nodes.append(n)
        if nodes:
            found = (key, sorted(nodes,key=lambda n:n.lineno),cell['source'])
            break
    if not found:
        raise RuntimeError('Missing source for '+topic)
    key,nodes,source=found
    ch=next(c for c in data['course']['chapters'] if c['id']==chapter_id)
    q=dict(ch['subjective'][0], id=f'past-implementation-{j+1}',topic=topic,prompt=prompt,
        answer='\n'.join(ast.unparse(n) for n in nodes),sourceId=key,
        isPastExam=True,
        explanation=prompt+' 인자와 축은 클래스의 선언 및 앞뒤 Tensor shape에서 확인합니다.',
        tensor_flow='[B,T,D] ↔ [B,H,T,Dh], D = H × Dh' if cls_name=='MultiHeadAttention' else '[B,T,D] 형태를 유지하도록 구성합니다.',
        code_signal='전체 클래스의 __init__ 및 다음 연산을 확인하세요.',retry='입출력 shape를 적은 뒤 다시 구현하세요.')
    ch['subjective'].append(q)
    extras.append(q)

def norm(s):
    try:
        s = ast.unparse(ast.parse(s))
    except (SyntaxError, IndentationError):
        pass
    return re.sub(r'\s+', '', s).replace("'", '"').replace('torch.nn.', 'nn.')

dpo_path=notebook_dir.parent/'Chapter_7_Exercise_Follow_Instructions_dpo.ipynb'
dpo='\n'.join(''.join(c.get('source',[])) for c in json.loads(dpo_path.read_text(encoding='utf-8'))['cells'] if c['cell_type']=='code')
replacements={
 'class PreferenceDataset': [('????','chosen_response'),('????','rejected_response')],
 'def compute_logprobs': [('????','1'),('????','-1'),('????','log_probs')],
 'def compute_dpo_loss(': [('????','model_chosen_logprobs'),('????','reference_chosen_logprobs'),('????','reference_logratios'),('????','logsigmoid')],
}
for name,pairs in replacements.items():
    start=dpo.index(name)
    next_def=re.search(r'\n(?:class |def )',dpo[start+1:])
    end=start+1+next_def.start() if next_def else len(dpo)
    source=dpo[start:end]
    for old,new in pairs:
        source=source.replace(old,new,1)
    ast.parse(source)
    data['original']['full-dpo-'+name]={'source':source}

units = []
for key, cell in data['original'].items():
    source = cell['source']
    try:
        tree = ast.parse(source)
    except SyntaxError:
        continue
    lines = source.splitlines()
    for top in tree.body:
        if isinstance(top, (ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef)):
            units.append((key, '\n'.join(lines[top.lineno-1:top.end_lineno])))
    # Notebook-level statements do not have a containing class/function.
    units.append((key, source))

patches = {}
unmatched = []
data['original']['lora-setup'] = {'source': data['original']['ch6lora-cell-37']['source']+'\n'+data['original']['ch6lora-cell-38']['source']}
units.append(('lora-setup', data['original']['lora-setup']['source']))
overrides = {
 'exam-llm05-05': 'encoded_tensor = encoded_tensor.unsqueeze(0)\nflat = token_ids.squeeze(0)',
 'exam-llm05-06': 'optimizer = torch.optim.AdamW(model.parameters(), lr=0.0004, weight_decay=0.1)',
 'exam-llm06a-02': 'loss = torch.nn.functional.cross_entropy(logits[:, -1, :], target_batch)',
 'exam-llm06b-05': 'param.requires_grad = False\nreplace_linear_with_lora(model, rank=16, alpha=16)',
}
for chapter in data['course']['chapters']:
    if chapter['id'] == 'llm-final-review':
        continue
    for q in chapter['subjective']:
        old_answer = q['answer']
        q['answer'] = overrides.get(q['id'], q['answer'])
        try:
            answers = [ast.get_source_segment(q['answer'], n) for n in ast.parse(q['answer']).body]
        except SyntaxError:
            answers = [q['answer']]
        candidates = []
        for key, source in units:
            if q['id']=='exam-llm02-07' and key!='ch2-cell-5':
                continue
            if q['id']=='exam-llm05-02' and not source.startswith('def train_model_simple'):
                continue
            if q['id'].startswith('exam-llm07d-') and not key.startswith('full-dpo-'):
                continue
            if q['id'].startswith('exam-llm07-') and key!='ch7-cell-46':
                continue
            tree = ast.parse(source)
            nodes = [n for n in ast.walk(tree) if isinstance(n, ast.stmt) and not isinstance(n, (ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef))]
            chosen = []
            for answer in answers:
                hits = [n for n in nodes if norm(answer) in norm(ast.get_source_segment(source,n) or '')]
                if not hits:
                    break
                chosen.append(min(hits, key=lambda n: (n.end_lineno-n.lineno, len(ast.get_source_segment(source,n)))))
            if len(chosen) != len(answers):
                continue
            # Prefer a full enclosing definition and the smallest relevant source.
            penalty = 0 if source.startswith(('class ', 'def ')) else 10000
            candidates.append((penalty+len(source), key, source, chosen))
        if not candidates:
            unmatched.append(q['id'])
            continue
        _, key, source, chosen = min(candidates, key=lambda x:x[0])
        spans = sorted(set((n.lineno-1,n.end_lineno) for n in chosen))
        spans = [s for s in spans if not any(t != s and t[0] <= s[0] and t[1] >= s[1] for t in spans)]
        lines = source.splitlines()
        answer_blocks = []
        for a,b in spans:
            block = lines[a:b]
            indent = len(block[0])-len(block[0].lstrip())
            answer_blocks.append(ast.unparse(ast.parse('\n'.join(line[indent:] for line in block))))
        masked = list(lines)
        for a,b in reversed(spans):
            indent = re.match(r'\s*', lines[a]).group()
            comments = [indent+token.string for token in tokenize.generate_tokens(io.StringIO('\n'.join(lines[a:b])).readline) if token.type==tokenize.COMMENT]
            masked[a:b] = comments + [indent+'????']
        answer = '\n'.join(answer_blocks)
        restored=[]
        blocks=iter(answer_blocks)
        for line in masked:
            if line.strip()=='????':
                indentation=line[:len(line)-len(line.lstrip())]
                restored.extend(indentation+part for part in next(blocks).splitlines())
            else:
                restored.append(line)
        assert ast.dump(ast.parse('\n'.join(restored))) == ast.dump(ast.parse(source)), q['id']
        patches[q['id']] = dict(scope_context='\n'.join(masked), answer=answer,
            accepted_answers=[answer], scope_source=key, isSourceBlank=False,
            previous_answer=old_answer,
            answer_blocks=answer_blocks,
            prompt=(('주석에 제시된 학습률·감쇠를 사용해 AdamW를 구성하세요.' if q['id']=='exam-llm05-06' else '마지막 token 위치의 분류 점수와 target으로 loss를 계산하세요.' if q['id']=='exam-llm06a-02' else q['prompt'])+'\n???? 위치의 완성된 코드 줄(들)을 위에서 아래 순서대로 작성하세요. 대입문·return·호출문 전체를 포함하세요.'),
            source_type='기출 유형 확장 · 전체 구현 복원')

past_ids = [
    'exam-llm03-02', 'exam-llm03-03', 'exam-llm03-05', 'exam-llm03-06',
    'exam-llm04-05', 'exam-llm04-08', 'exam-llm04-09',
]
out = '/* Generated by build_subjective_scope.py. */\n(()=>{\nconst patches='+json.dumps(patches,ensure_ascii=False,indent=2)+';\n'
out += 'const extras='+json.dumps(extras,ensure_ascii=False)+';\nfor(const q of extras) window.LLM_COURSE.chapters.find(c=>c.id===q.chapterId).subjective.push(q);\n'
out += 'const pastExamIds='+json.dumps(past_ids,ensure_ascii=False)+';\n'
out += '''const course=window.LLM_COURSE;
for(const ch of course.chapters) for(const q of ch.subjective) {
  if(patches[q.id]) {
    q.mcq_context=q.problem_context;
    Object.assign(q, patches[q.id]);
  }
  if(pastExamIds.includes(q.id)) q.isPastExam=true;
}
for(const ch of course.chapters) ch.questionCount=ch.subjective.length;
// Final review copies use the same implementation scope as their source question.
const final=course.chapters.find(c=>c.id==='llm-final-review');
if(final) for(const q of final.subjective) {
  const source=Object.values(patches).find(p=>p.previous_answer===q.answer);
  if(source) Object.assign(q,source);
}
})();
'''
(ROOT/'subjective_scope.js').write_text(out,encoding='utf-8')
if unmatched:
    raise RuntimeError('Questions without complete scope: '+str(unmatched))
print(f'Updated {len(patches)} questions; unmatched: {unmatched}')
