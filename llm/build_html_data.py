# -*- coding: utf-8 -*-
import json
import re
from difflib import SequenceMatcher
from pathlib import Path

root = Path(__file__).resolve().parent
source = root.parent / "ai_coding_recall_desktop" / "llm_course.json"
data = json.loads(source.read_text(encoding="utf-8"))
data["sample_mode"] = False
notebook_path = root.parents[1] / "1. llm_hands_on-main" / "llm_hands_on-main" / "Chapter_2_Exercise_Dataset.ipynb"
notebook = json.loads(notebook_path.read_text(encoding="utf-8"))


def is_code_blank(line):
    """Return True only for executable blank lines, not TODO/hint comments."""
    return "????" in line and not line.lstrip().startswith("#")


def filled_line(problem_line, solution_lines):
    """Find the matching completed line while retaining the exercise comments."""
    problem_shape = re.sub(r"\?+", "", problem_line).strip()
    candidates = [line for line in solution_lines if not line.lstrip().startswith("#")]
    if not candidates:
        raise ValueError(f"No solution candidates for: {problem_line}")

    def score(candidate):
        candidate_shape = candidate.strip()
        similarity = SequenceMatcher(None, problem_shape, candidate_shape).ratio()
        indent_match = len(problem_line) - len(problem_line.lstrip()) == len(candidate) - len(candidate.lstrip())
        return similarity + (0.15 if indent_match else 0)

    best = max(candidates, key=score)
    if score(best) < 0.35:
        raise ValueError(f"Could not match solution line for: {problem_line}")
    return best


solution_by_code_index = {
    cell["cell"]: cell["source"].splitlines()
    for cell_id, cell in data.get("cells", {}).items()
    if cell_id.startswith("ch2-cell-")
}
code_cells = []
code_index = -1
for cell_number, cell in enumerate(notebook["cells"], 1):
    if cell.get("cell_type") != "code":
        continue
    source_lines = cell.get("source", [])
    source_text = "".join(source_lines) if isinstance(source_lines, list) else source_lines
    if source_text.strip():
        code_index += 1
        problem_lines = source_text.rstrip().splitlines()
        solution_lines = solution_by_code_index.get(code_index, problem_lines)
        marked_problem = []
        marked_answer = []
        for line in problem_lines:
            highlighted = is_code_blank(line)
            answer_line = filled_line(line, solution_lines) if highlighted else line
            marked_problem.append({"text": line, "highlight": highlighted})
            marked_answer.append({"text": answer_line, "highlight": highlighted})
        code_cells.append({
            "cell_number": cell_number,
            "code_index": code_index,
            "blank_count": sum(line["highlight"] for line in marked_problem),
            "problem_lines": marked_problem,
            "answer_lines": marked_answer,
        })
data["chapters"][0]["full_code_cells"] = code_cells
data["chapters"][0]["notebook_goal"] = "원문을 토큰 ID로 변환하고, 다음 토큰 학습용 입력·정답 배치를 만든 뒤 임베딩 Tensor로 바꾸는 전체 데이터 파이프라인을 구현한다."
data["chapters"][0]["theory_guide"] = [
    {
        "title": "1. 토큰화: 문자열과 정수 ID의 왕복",
        "concept": "토큰화는 문장을 모델이 처리할 수 있는 정수 token ID의 열로 바꾸는 과정입니다. encode는 문자열을 ID로 바꾸고, decode는 ID를 다시 문자열로 복원합니다.",
        "flow": "str → tokenizer.encode → list[int] → tokenizer.decode → str",
        "code_signal": "tokenizer 뒤의 메서드와 입력 자료형을 확인합니다. text가 입력이면 encode, integers가 입력이면 decode입니다.",
        "exam_clue": "특수 토큰 <|endoftext|>이 포함될 수 있으면 allowed_special 인자를 그대로 유지합니다.",
    },
    {
        "title": "2. 다음 토큰 학습: 입력보다 한 칸 뒤가 정답",
        "concept": "LLM은 현재까지의 token들을 보고 바로 다음 token을 예측합니다. 따라서 target은 input과 길이가 같지만 시작과 끝 위치가 각각 1만큼 뒤로 이동합니다.",
        "flow": "input = token_ids[i : i+L] / target = token_ids[i+1 : i+L+1]",
        "code_signal": "input_chunk와 target_chunk가 함께 나오면 두 슬라이스의 길이는 같고 target의 양 끝에 모두 +1이 있는지 봅니다.",
        "exam_clue": "시작점만 +1 하고 끝점을 그대로 두면 target 길이가 하나 짧아지는 것이 대표 오답입니다.",
    },
    {
        "title": "3. Dataset과 DataLoader: 샘플을 만들고 배치로 묶기",
        "concept": "Dataset은 idx 하나에 해당하는 입력·정답 쌍을 돌려주고, DataLoader는 Dataset을 순회하면서 여러 샘플을 batch tensor로 묶습니다.",
        "flow": "token_ids → GPTDatasetV1 → (input_ids[idx], target_ids[idx]) → DataLoader → [B,T]",
        "code_signal": "__getitem__(idx)는 같은 idx의 input과 target을 반환하며, DataLoader의 첫 번째 인자는 생성된 dataset 객체입니다.",
        "exam_clue": "DataLoader에 Dataset 클래스 이름이나 원문 text가 아니라 dataset 변수를 전달해야 합니다.",
    },
    {
        "title": "4. 토큰 임베딩: 정수 ID를 학습 가능한 실수 벡터로",
        "concept": "Embedding은 token ID를 행 번호처럼 사용해 학습 가능한 벡터를 조회하는 layer입니다. 첫 인자는 전체 token 개수, 둘째 인자는 token 하나를 표현할 벡터 차원입니다.",
        "flow": "input_ids [B,T] int64 → Embedding(vocab_size, output_dim) → [B,T,D] float",
        "code_signal": "레이어 생성에는 vocab_size와 output_dim이 필요하고, 호출할 때는 정수 token tensor인 input_ids가 들어갑니다.",
        "exam_clue": "Embedding 생성자와 Embedding 호출을 구분합니다. 생성은 크기 두 개, 호출은 input_ids 하나입니다.",
    },
    {
        "title": "5. 위치 임베딩: 같은 단어라도 순서를 구분하기",
        "concept": "토큰 임베딩만으로는 배열의 순서를 알 수 없습니다. 위치별 벡터를 만들어 token embedding에 더하면 각 token의 내용과 위치를 함께 표현할 수 있습니다.",
        "flow": "token_embeddings [B,T,D] + positional_embeddings [T,D] → input_embeddings [B,T,D]",
        "code_signal": "torch.arange(context_length)는 0부터 T-1까지 위치 ID를 만들고, broadcasting으로 모든 batch에 같은 위치 벡터가 더해집니다.",
        "exam_clue": "token과 position embedding의 마지막 차원 D가 같아야 덧셈이 가능합니다.",
    },
]
for chapter in data["chapters"][1:]:
    chapter["notebook_goal"] = chapter["capability"]
    chapter["theory_guide"] = [
        {"title": f"{i}. {point['title']}", "concept": point["purpose"],
         "flow": point["flow"], "code_signal": point["code"], "exam_clue": point["watch"]}
        for i, point in enumerate(chapter["key_points"], 1)
    ]
    nb = json.loads((notebook_path.parent / chapter["file"]).read_text(encoding="utf-8"))
    pool = []
    for question in chapter["subjective"]:
        pool.extend(data["cells"][question["sourceId"]]["source"].splitlines())
    # Include complete reference notebooks, not just selected examination snippets.
    refs = {data["cells"][q["sourceId"]]["answerSource"] for q in chapter["subjective"]}
    for ref in refs:
        ref_nb = json.loads((notebook_path.parent / ref).read_text(encoding="utf-8"))
        for c in ref_nb["cells"]:
            if c["cell_type"] == "code":
                pool.extend("".join(c["source"]).splitlines())
    chapter["full_code_cells"] = []
    for number, c in enumerate(nb["cells"], 1):
        if c["cell_type"] != "code":
            continue
        lines = "".join(c["source"]).rstrip().splitlines()
        if not lines:
            continue
        problems, answers = [], []
        in_docstring = False
        for line_index, line in enumerate(lines):
            if line.count('"""') % 2 or line.count("'''") % 2:
                in_docstring = not in_docstring
            blank = bool(re.search(r"\?{2,}", line)) and not line.lstrip().startswith("#")
            blank = blank and not in_docstring
            completed = line
            if blank:
                parts = re.split(r"\?{2,}", line.split(' #', 1)[0])
                pattern = "(.+?)".join(re.escape(re.sub(r"\s+", "", part)) for part in parts)
                matches = {}
                for candidate in pool:
                    if candidate.lstrip().startswith("#") or "??" in candidate:
                        continue
                    match = re.fullmatch(pattern, re.sub(r"\s+", "", candidate.split(' #', 1)[0]))
                    if not match and line.rstrip().endswith('('):
                        match = re.match(pattern, re.sub(r"\s+", "", candidate))
                    if not match and (line.rstrip().endswith(',') or '=' not in line):
                        match = re.search(pattern, re.sub(r"\s+", "", candidate))
                    if match:
                        matches[tuple(match.groups())] = candidate
                if len(matches) > 1:
                    previous = [p['text'].strip() for p in answers if p['text'].strip() and not p['text'].lstrip().startswith('#')][-3:]
                    ranked = []
                    for groups, candidate in matches.items():
                        best = 0
                        for pos, item in enumerate(pool):
                            if item == candidate:
                                history = [x.strip() for x in pool[max(0,pos-12):pos] if x.strip() and not x.lstrip().startswith('#')][-3:]
                                best = max(best, SequenceMatcher(None, re.sub(r'\s+', '', '\n'.join(previous)), re.sub(r'\s+', '', '\n'.join(history))).ratio())
                        ranked.append((best, groups))
                    ranked.sort(reverse=True)
                    if len(ranked) == 1 or ranked[0][0] > ranked[1][0]:
                        groups = ranked[0][1]
                        matches = {groups: matches[groups]}
                if len(matches) != 1:
                    if 'torch.tensor(encoded).????(0)' in line:
                        matches = {('unsqueeze',): 'encoded_tensor = torch.tensor(encoded).unsqueeze(0)'}
                    elif 'weight_decay=settings["weight_decay"]' in line:
                        matches = {('parameters', 'lr'): 'model.parameters(), lr=settings["learning_rate"], weight_decay=settings["weight_decay"]'}
                    elif 'torch.empty(in_dim, ????' in line or 'torch.zeros(????, out_dim)' in line:
                        matches = {('rank',): line.replace('????', 'rank')}
                    elif 'self.???? / self.rank' in line:
                        matches = {('alpha', 'A', 'B'): ''}
                    elif 'self.linear(x) + self.????(x)' in line:
                        matches = {('lora',): ''}
                    elif 'torch.nn.????' in line:
                        matches = {('Linear',): ''}
                    elif 'param.requires_grad = ????' in line:
                        matches = {('False',): ''}
                    elif '????(model, rank=LORA_RANK' in line:
                        matches = {('replace_linear_with_lora',): ''}
                    elif 'padded = new_item + [????]' in line:
                        matches = {('pad_token_id',): ''}
                    elif 'chosen_full_tokens = ' in line:
                        matches = {('entry["chosen"]',): ''}
                    elif 'rejected_full_tokens = ' in line:
                        matches = {('entry["rejected"]',): ''}
                if len(matches) != 1:
                    raise ValueError(f"{chapter['file']} cell {number}: {line!r}: {list(matches)[:8]}")
                values = iter(next(iter(matches)))
                completed = re.sub(r"\?{2,}", lambda _: next(values), line)
                if re.fullmatch(r'\s*\?+\s*', line):
                    completed = line[:len(line)-len(line.lstrip())] + next(iter(matches.values())).strip()
                if 'train 모드' in line:
                    completed = line.replace('????', 'train')
                if 'full_tokens = tokenizer.encode(f"' in completed:
                    completed = completed.replace('entry["chosen"]', "entry['chosen']").replace('entry["rejected"]', "entry['rejected']")
            problems.append({"text": line, "highlight": blank})
            answers.append({"text": completed, "highlight": blank})
        chapter["full_code_cells"].append({"cell_number": number, "blank_count": sum(p["highlight"] for p in problems), "problem_lines": problems, "answer_lines": answers})
    print(chapter["file"], len(chapter["full_code_cells"]), "cells")

(root / "course_data.js").write_text(
    "window.LLM_COURSE = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n",
    encoding="utf-8",
)
print(f"course_data.js: {len(data['chapters'])} notebooks, {len(code_cells)} full code cells")
