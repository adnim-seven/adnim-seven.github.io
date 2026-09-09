# -*- coding: utf-8 -*-
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def require(value, message):
    if not value:
        raise AssertionError(message)


html = (ROOT / "index.html").read_text(encoding="utf-8")
require(html.count('data-code-view=') == 3, "문제/정답/좌우 비교 토글 누락")
for linked in re.findall(r'(?:src|href)="([^"]+)"', html):
    if linked.startswith(("http:", "https:", "#")):
        continue
    require((ROOT / linked).exists(), f"연결 파일 누락: {linked}")

raw = (ROOT / "course_data.js").read_text(encoding="utf-8").strip()
require(raw.startswith("window.LLM_COURSE = ") and raw.endswith(";"), "학습 데이터 형식 오류")
course = json.loads(raw[len("window.LLM_COURSE = "):-1])
require(course.get("sample_mode") is False, "전체 노트북 모드가 아님")
require(len(course["chapters"]) == 8 and course["chapters"][0]["id"] == "llm-02", "Chapter 2–7의 8개 노트북 필요")
chapter = course["chapters"][0]
require(chapter.get("notebook_goal"), "노트북 한 줄 목표 누락")
require(len(chapter["key_points"]) == 4, "핵심 정리는 4개여야 함")
require(len(chapter.get("theory_guide", [])) == 5, "코드 전 핵심 개념은 5개여야 함")
full_code_cells = chapter.get("full_code_cells", [])
require(len(full_code_cells) == 8, "원본 전체 코드 셀은 8개여야 함")
require(sum(cell["blank_count"] for cell in full_code_cells) == 9, "실제 구현 빈칸은 9줄이어야 함")
require(sum(bool(cell["blank_count"]) for cell in full_code_cells) == 5, "빈칸이 있는 코드 셀은 5개여야 함")
for cell in full_code_cells:
    require(len(cell["problem_lines"]) == len(cell["answer_lines"]), "좌우 전체 코드 줄 수 불일치")
    for problem, answer in zip(cell["problem_lines"], cell["answer_lines"]):
        if problem["highlight"]:
            require("????" in problem["text"] and "????" not in answer["text"], "정답에서 빈칸이 채워지지 않음")
require(len(chapter["mcq"]) == 3, "5지선다는 3개여야 함")
require(len(chapter["subjective"]) == 9, "주관식은 9개여야 함")
questions = {q["id"]: q for q in chapter["subjective"]}
for item in chapter["mcq"]:
    require(len(item["choices"]) == 5, f"{item['id']}: 선택지 수 오류")
    require(len({c["text"] for c in item["choices"]}) == 5, f"{item['id']}: 중복 선택지")
    source = questions[item["source_question_id"]]
    correct = item["choices"][item["answer_index"]]["text"]
    require("".join(correct.split()).replace("'", '"') == "".join(source["answer"].split()).replace("'", '"'), f"{item['id']}: 원본 빈칸 정답과 불일치")
for item in chapter["subjective"]:
    source = course["cells"][item["sourceId"]]["source"]
    require(source.count(item["answer"]) > item.get("occurrence", 0), f"{item['id']}: 원본 코드에서 빈칸을 만들 수 없음")

print("PASS: Chapter 2 HTML · 핵심 4 · 전체 코드 셀 8 · 실제 빈칸 9줄 · 5지선다 3x5 · 주관식 9 · 원본 빈칸 정답 일치")
