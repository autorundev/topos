"""
Throwaway AST/regex parser: extracts CREATE TABLE column schemas from ~/vectoros source, WITHOUT
importing the vectoros package (mirrors scripts/extract_taxo_io.py's discipline).

Vault tables have no ORM — they're raw `CREATE TABLE IF NOT EXISTS <name> (...)` strings, embedded as
Python string literals (module-level `_SCHEMA = ` triple-quoted assignments AND inline
`conn.executescript(...)` triple-quoted calls) scattered across ~14 files. Strategy: use `ast` to find
EVERY string-literal node in each file (safe — no exec/import), then regex-parse SQL `CREATE TABLE`
blocks out of each string's raw text.

Output JSON shape: {"<table_name>": [{"name":.., "type":.., "required": bool}, ...], ...}

Run: python3 scripts/extract_vault_schema.py
"""
from __future__ import annotations

import ast
import json
import re
import sys
from pathlib import Path

VECTOROS_SRC = Path.home() / "vectoros" / "src"

CREATE_TABLE_RE = re.compile(
    r"CREATE TABLE(?:\s+IF NOT EXISTS)?\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\)\s*;",
    re.DOTALL,
)
COMMENT_RE = re.compile(r"--.*?(?=\n|$)")
TABLE_CONSTRAINT_PREFIXES = ("PRIMARY KEY(", "PRIMARY KEY (", "FOREIGN KEY", "UNIQUE(", "UNIQUE (", "CHECK(", "CHECK (")
COLUMN_RE = re.compile(r"^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s+([A-Za-z]+)")


def split_top_level(body: str) -> list[str]:
    """Split a CREATE TABLE body on commas that are NOT inside parens (so DEFAULT (expr) survives)."""
    parts, depth, cur = [], 0, []
    for ch in body:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append("".join(cur))
            cur = []
        else:
            cur.append(ch)
    if cur:
        parts.append("".join(cur))
    return parts


def parse_create_table(name: str, body: str) -> list[dict]:
    body = COMMENT_RE.sub("", body)
    columns = []
    for frag in split_top_level(body):
        frag = frag.strip()
        if not frag or frag.upper().startswith(TABLE_CONSTRAINT_PREFIXES):
            continue
        m = COLUMN_RE.match(frag)
        if not m:
            continue
        col_name, col_type = m.group(1), m.group(2).upper()
        required = "NOT NULL" in frag.upper() or "PRIMARY KEY" in frag.upper()
        columns.append({"name": col_name, "type": col_type, "required": required})
    return columns


def extract_string_literals(py_path: Path) -> list[str]:
    try:
        tree = ast.parse(py_path.read_text(encoding="utf-8"), filename=str(py_path))
    except (SyntaxError, UnicodeDecodeError):
        return []
    out = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Constant) and isinstance(node.value, str):
            out.append(node.value)
    return out


def main() -> int:
    if not VECTOROS_SRC.exists():
        print(json.dumps({"error": f"{VECTOROS_SRC} not found"}), file=sys.stderr)
        return 1
    tables: dict[str, list[dict]] = {}
    for py_path in VECTOROS_SRC.rglob("*.py"):
        for literal in extract_string_literals(py_path):
            if "CREATE TABLE" not in literal:
                continue
            for m in CREATE_TABLE_RE.finditer(literal):
                name, body = m.group(1), m.group(2)
                cols = parse_create_table(name, body)
                if cols:
                    tables[name] = cols   # last definition wins if a table is re-declared (rare, matches SQLite IF NOT EXISTS semantics — first-wins would need re-order; last-wins is the simpler, documented choice)
    print(json.dumps(tables, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
