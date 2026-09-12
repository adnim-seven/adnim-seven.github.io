"""Create full-notebook Chapter 6 implementation exams from the verified notebooks."""
import ast
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
NOTEBOOK_ROOT = ROOT.parents[2] / "1. llm_hands_on-main" / "llm_hands_on-main" / "llm_from_scratch"


def assignment(node):
    if isinstance(node, ast.Assign) and len(node.targets) == 1:
        return ast.unparse(node.targets[0]), ast.unparse(node.value)
    if isinstance(node, ast.AnnAssign) and node.value is not None:
        return ast.unparse(node.target), ast.unparse(node.value)
    return None


def find_nodes(source, selector):
    tree = ast.parse(source)
    found = selector(tree)
    if not found:
        raise RuntimeError(f"Could not find intended exam line: {selector.__name__}")
    return found


def mask_source(source, nodes, start_no, prompts):
    lines = source.splitlines()
    blanks = []
    plan = list(enumerate(sorted(nodes, key=lambda item: item.lineno)))
    for offset, node in reversed(plan):
        data = assignment(node)
        if data:
            lhs, answer = data
            indent = lines[node.lineno - 1][:len(lines[node.lineno - 1]) - len(lines[node.lineno - 1].lstrip())]
            replacement = f"{indent}{lhs} = ????  # [빈칸 {start_no + offset:02d}]"
        elif isinstance(node, ast.Return):
            indent = lines[node.lineno - 1][:len(lines[node.lineno - 1]) - len(lines[node.lineno - 1].lstrip())]
            answer = ast.unparse(node.value)
            replacement = f"{indent}return ????  # [빈칸 {start_no + offset:02d}]"
        else:
            indent = lines[node.lineno - 1][:len(lines[node.lineno - 1]) - len(lines[node.lineno - 1].lstrip())]
            answer = ast.unparse(node)
            replacement = f"{indent}????  # [빈칸 {start_no + offset:02d}]"
        lines[node.lineno - 1:node.end_lineno] = [replacement]
        blanks.insert(0, {
            "id": f"blank-{start_no + offset:02d}",
            "number": start_no + offset,
            "answer": answer,
            "prompt": prompts[offset],
        })
    return "\n".join(lines), blanks


def selector_dataset(tree):
    nodes = []
    for node in ast.walk(tree):
        data = assignment(node)
        if not data:
            continue
        lhs, rhs = data
        if lhs == "self.encoded_texts" and ("self.max_length" in rhs or "pad_token_id" in rhs):
            nodes.append(node)
        elif lhs == "label":
            nodes.append(node)
    # The two encoded_texts assignments and one label assignment, in source order.
    return sorted(nodes, key=lambda item: item.lineno)


def selector_exact(target):
    def select(tree):
        return [node for node in ast.walk(tree) if assignment(node) and assignment(node)[0] == target]
    select.__name__ = f"assignment_{target}"
    return select


def selector_param(value):
    def select(tree):
        return [node for node in ast.walk(tree) if assignment(node) and assignment(node)[0] == "param.requires_grad" and assignment(node)[1] == value]
    select.__name__ = f"param_requires_grad_{value}"
    return select


def selector_lora(tree):
    targets = {"self.A", "self.B", "self.alpha", "x"}
    nodes = [node for node in ast.walk(tree) if assignment(node) and assignment(node)[0] in targets]
    return sorted(nodes, key=lambda item: item.lineno)


def selector_return(tree):
    return [node for node in ast.walk(tree) if isinstance(node, ast.Return)]


def selector_replace(tree):
    wanted = {"model", "name", "module"}
    nodes = []
    for node in ast.walk(tree):
        text = ast.unparse(node)
        if isinstance(node, ast.Expr) and text.startswith("setattr("):
            nodes.append(node)
        elif isinstance(node, ast.Expr) and text.startswith("replace_linear_with_lora("):
            nodes.append(node)
    return sorted(nodes, key=lambda item: item.lineno)


def build_exam(chapter_id, title, filename, targets):
    notebook = json.loads((NOTEBOOK_ROOT / filename).read_text(encoding="utf-8"))
    cells = []
    blanks = []
    next_no = 1
    target_by_cell = {cell_no: (selector, prompts) for cell_no, selector, prompts in targets}
    for index, cell in enumerate(notebook["cells"]):
        if cell.get("cell_type") != "code":
            continue
        source = "".join(cell.get("source", [])).rstrip()
        if not source:
            continue
        rendered = source
        if index in target_by_cell:
            selector, prompts = target_by_cell[index]
            nodes = find_nodes(source, selector)
            rendered, new_blanks = mask_source(source, nodes, next_no, prompts)
            blanks.extend(new_blanks)
            next_no += len(new_blanks)
        cells.append({"cell_number": index + 1, "source": rendered})
    return {
        "chapterId": chapter_id,
        "title": title,
        "file": filename,
        "instruction": "전체 노트북을 위에서 아래로 읽고, 각 빈칸이 요구하는 코드만 작성하세요. 답은 빈칸 번호 순서대로 독립적으로 채점됩니다.",
        "cells": cells,
        "blanks": blanks,
    }


classification = build_exam(
    "llm-06a",
    "06A · Classification Finetuning · 전체 노트북 시험",
    "Chapter_6_Finetuning_for_Text_Classification_KR.ipynb",
    [
        (30, selector_dataset, [
            "설정된 최대 길이만 남기도록 토큰 ID 리스트를 자르세요.",
            "부족한 길이만큼 pad_token_id를 뒤에 붙이세요.",
            "현재 샘플의 Label 컬럼을 가져오세요.",
        ]),
        (54, selector_param("False"), ["기반 GPT 전체를 학습 대상에서 제외하세요."]),
        (56, selector_exact("model.out_head"), ["GPT의 vocabulary 출력 head를 2개 클래스 분류 head로 바꾸세요."]),
        (62, selector_param("True"), [
            "마지막 Transformer Block을 다시 학습 가능하게 하세요.",
            "최종 LayerNorm을 다시 학습 가능하게 하세요.",
        ]),
        (88, selector_exact("loss"), [
            "문장 분류용 마지막 token logits과 target_batch로 cross entropy loss를 계산하세요.",
            "언어 모델링 분기에서는 모든 token 위치를 비교하도록 logits와 target을 flatten하세요.",
        ]),
    ],
)

lora = build_exam(
    "llm-06b",
    "06B · Classification Finetuning with LoRA · 전체 노트북 시험",
    "Chapter_6_Finetuning_for_Text_Classification_LoRA_KR.ipynb",
    [
        (29, selector_lora, [
            "입력 차원에서 rank로 가는 학습 행렬 A를 생성하고 초기화하세요.",
            "rank에서 출력 차원으로 가는 학습 행렬 B를 0으로 초기화하세요.",
            "LoRA 변화량 크기를 조절할 alpha를 저장하세요.",
            "A와 B의 저랭크 변화량에 alpha/rank 스케일을 적용해 반환하세요.",
        ]),
        (32, selector_return, ["기존 Linear 출력과 LoRA 변화량을 더해 반환하세요."]),
        (35, selector_replace, [
            "찾은 Linear 레이어를 기존 가중치를 보존하는 LinearWithLoRA로 교체하세요.",
            "컨테이너 레이어 내부까지 재귀적으로 탐색하세요.",
        ]),
        (37, selector_param("False"), ["LoRA 주입 전 기존 모델 파라미터를 모두 동결하세요."]),
    ],
)

payload = {"llm-06a": classification, "llm-06b": lora}
(ROOT / "notebook_full_exam.js").write_text(
    "/* Generated by build_notebook_full_exam.py. */\nwindow.NOTEBOOK_FULL_EXAMS = "
    + json.dumps(payload, ensure_ascii=False)
    + ";\n",
    encoding="utf-8",
)
print(f"Created {len(classification['cells']) + len(lora['cells'])} code cells and {len(classification['blanks']) + len(lora['blanks'])} blanks.")
