import json
import ast
from pathlib import Path
root = Path(__file__).resolve().parent
raw = (root / 'course_data.js').read_text(encoding='utf-8')
data = json.loads(raw[len('window.LLM_COURSE = '):].strip().rstrip(';'))
assert len(data['chapters']) == 8
total = 0
for chapter in data['chapters']:
    assert chapter['notebook_goal'] and chapter['theory_guide']
    for cell in chapter['full_code_cells']:
        assert len(cell['problem_lines']) == len(cell['answer_lines'])
        for p, a in zip(cell['problem_lines'], cell['answer_lines']):
            if p['highlight']:
                assert '??' in p['text'] and '??' not in a['text']
                total += 1
            else:
                assert p['text'] == a['text']
        source = '\n'.join(l['text'] for l in cell['answer_lines'])
        source = '\n'.join('' if l.lstrip().startswith(('!', '%')) else l for l in source.splitlines())
        try:
            ast.parse(source)
        except SyntaxError as exc:
            raise ValueError((chapter['file'], cell['cell_number'], str(exc)))
    questions = {q['id']: q for q in chapter['subjective']}
    for item in chapter['mcq']:
        assert len(item['choices']) == 5 and item['source_question_id'] in questions
    for q in chapter['subjective']:
        assert data['cells'][q['sourceId']]['source'].count(q['answer']) > q.get('occurrence', 0)
print(f'PASS: 8 notebooks, {total} completed lines; comments preserved; answer code syntax checked')
