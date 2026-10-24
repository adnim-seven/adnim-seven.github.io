import json
import ast
import os
import sys

# Force UTF-8 for stdout/stderr
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

def check_file(subj, filename, var_name):
    filepath = os.path.join(subj, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    idx = text.find(var_name)
    if idx == -1:
        print(f"Could not find {var_name} in {filepath}")
        return
    
    brace_start = text.find('{', idx)
    brace_end = text.rfind('}')
    if brace_start == -1 or brace_end == -1:
        print(f"Could not find JSON object in {filepath}")
        return
    
    json_str = text[brace_start:brace_end+1]
    data = json.loads(json_str)
    print(f"\n=== Subject: {subj} ({len(data)} notebooks) ===")
    errors_found = 0
    for nb_name, nb in data.items():
        blank_map = {b['id']: b['answer'] for b in nb.get('blanks', [])}
        for cell in nb.get('cells', []):
            if cell.get('type') != 'code':
                continue
            src = cell['source']
            for bid, ans in blank_map.items():
                src = src.replace('[[BLANK:' + bid + ']]', ans)
            
            # handle jupyter magic/shell lines, including line continuation
            clean_lines = []
            skip_continuation = False
            for line in src.splitlines():
                s = line.strip()
                if skip_continuation:
                    clean_lines.append('# ' + line)
                    if not s.endswith('\\'):
                        skip_continuation = False
                    continue
                if s.startswith(('!', '%')) or s.startswith('\\'):
                    clean_lines.append('# ' + line)
                    if s.endswith('\\'):
                        skip_continuation = True
                else:
                    clean_lines.append(line)
            clean = '\n'.join(clean_lines)

            try:
                ast.parse(clean)
            except SyntaxError as e:
                errors_found += 1
                print(f"[FAIL] SyntaxError in {nb_name} cell {cell.get('number')} (code #{cell.get('code_number')}): line {e.lineno}: {e.msg}")
                lines = clean.splitlines()
                if e.lineno and 0 <= e.lineno - 1 < len(lines):
                    print(f"   >>> {lines[e.lineno - 1]}")
            except Exception as e:
                errors_found += 1
                print(f"[FAIL] Error in {nb_name} cell {cell.get('number')}: {e}")
    if errors_found == 0:
        print(f"[PASS] All code cells in {subj} parse successfully!")

check_file('llm', 'inline_exam_data.js', 'LLM_INLINE_EXAMS')
check_file('rag', 'inline_exam_data.js', 'INLINE_EXAM_MAP')

def inspect_llm_cell(cell_num, file_name):
    with open('llm/inline_exam_data.js', 'r', encoding='utf-8') as f:
        text = f.read()
    start = text.find('window.LLM_INLINE_EXAMS = {')
    brace_start = text.find('{', start)
    brace_end = text.rfind('}')
    data = json.loads(text[brace_start:brace_end+1])
    nb = data[file_name]
    cell = [c for c in nb['cells'] if c['number'] == cell_num][0]
    print(f"\n--- {file_name} Cell {cell_num} Source snippet ---")
    lines = cell['source'].splitlines()
    for i, l in enumerate(lines):
        if '????' in l or 'cabatch' in l or 'entry[' in l or 'requires_grad' in l or 'padded[' in l:
            for j in range(max(0, i-2), min(len(lines), i+3)):
                print(f"  {j+1}: {lines[j]}")
            print("  ---")

inspect_llm_cell(2, "Chapter_3_Excercise_Attention.ipynb")
inspect_llm_cell(2, "Chapter_6_Excercise_Finetuning_Classification.ipynb")
inspect_llm_cell(4, "Chapter_6_Excercise_Finetuning_Classification_LoRA.ipynb")
inspect_llm_cell(1, "Chapter_7_Exercise_Follow_Instructions.ipynb")
inspect_llm_cell(1, "Chapter_7_Exercise_Follow_Instructions_dpo.ipynb")
