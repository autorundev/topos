#!/usr/bin/env python3
"""Throwaway AST parser — extracts per-tool and per-detector I/O from the
VectorOS source tree (~/vectoros), WITHOUT importing the vectoros package
(pure literal/AST extraction, no runtime deps).

Sources (read-only):
  - ~/vectoros/src/tools/_schemas.py       -> tool input params (+ best-effort output label)
  - ~/vectoros/src/awareness/detectors/__init__.py -> detector input/output (eval_mode + event_class)

Output: prints one JSON object to stdout:
  {
    "tools": { "<tool_name>": {"inputs": [{"name":.., "required": bool}, ...], "outputs": [str] or [] }, ... },
    "detectors": { "<detector_name>": {"inputs": [{"name": "clock-tick"|"state-write"}], "outputs": [event_class]}, ... },
    "meta": {"tool_count": N, "detector_count": N}
  }

This script is committed for reproducibility (Topos Step2a). It does NOT
write any TypeScript — `data/taxonomy_io.ts` is hand-authored from this
script's output, matched against `data/taxonomy.ts` node ids by name.

Usage:
    python3 scripts/extract_taxo_io.py [--vectoros-root ~/vectoros]
"""
from __future__ import annotations

import argparse
import ast
import json
import re
import sys
from pathlib import Path

DEFAULT_VECTOROS_ROOT = Path.home() / "vectoros"


# ---------------------------------------------------------------------------
# Tools: ~/vectoros/src/tools/_schemas.py
# ---------------------------------------------------------------------------

def _collect_top_level_lists(tree: ast.Module) -> dict[str, list]:
    """Every top-level `NAME = [...]` or `NAME: type = [...]` whose value is
    a list literal. Returns {var_name: [literal_eval'd dict, ...]}.
    """
    out: dict[str, list] = {}
    for node in tree.body:
        target_name = None
        value = None
        if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
            target_name = node.targets[0].id
            value = node.value
        elif isinstance(node, ast.AnnAssign) and isinstance(node.target, ast.Name):
            target_name = node.target.id
            value = node.value
        else:
            continue
        if value is not None and isinstance(value, ast.List):
            try:
                out[target_name] = [ast.literal_eval(elt) for elt in value.elts]
            except Exception:
                # Non-literal element (shouldn't happen per pre-check) — skip this list.
                continue
    return out


def _find_all_tools_member_order(tree: ast.Module) -> list[str]:
    """Reads `ALL_TOOLS = A + B + C + ...` and returns [A, B, C, ...] in
    order, so we replicate exactly what ships to Claude (excludes any stub
    schema deliberately NOT referenced, e.g. UPDATE_REFLECTION_STATUS_STUB_SCHEMA).
    """
    for node in tree.body:
        if (
            isinstance(node, ast.Assign)
            and len(node.targets) == 1
            and isinstance(node.targets[0], ast.Name)
            and node.targets[0].id == "ALL_TOOLS"
        ):
            names: list[str] = []

            def walk(n: ast.AST) -> None:
                if isinstance(n, ast.BinOp) and isinstance(n.op, ast.Add):
                    walk(n.left)
                    walk(n.right)
                elif isinstance(n, ast.Name):
                    names.append(n.id)
                else:
                    raise ValueError(f"Unexpected node in ALL_TOOLS expr: {ast.dump(n)}")

            walk(node.value)
            return names
    raise ValueError("ALL_TOOLS assignment not found in _schemas.py")


_RETURNS_RE = re.compile(r"Returns:?\s+(.+?)(?:\.\s|\.$|$)", re.DOTALL)
_WS_RE = re.compile(r"\s+")


def _derive_output_label(description: str) -> str | None:
    """Best-effort SHORT output label from a tool description.

    Looks for "Returns X." or "Returns: X." (case-sensitive, matches the
    house style in _schemas.py). Not in the schema — this is a judgment
    call, not authoritative. Returns None (omit outputs) when no such
    phrase is present.

    NOTE: an earlier draft also matched a "→ X" arrow fallback (per the
    spec's "→ X" example), but a real-data pass showed the arrow is used
    pervasively for NARRATIVE transitions unrelated to return values
    (e.g. "delete request → delete (do NOT refuse...)", "Recoverable →
    no confirmation.") — false-positive rate too high, dropped. Only the
    literal "Returns" keyword (the actual house style used throughout
    _schemas.py) is reliable enough to auto-extract.
    """
    m = _RETURNS_RE.search(description)
    if not m:
        return None
    label = _WS_RE.sub(" ", m.group(1)).strip()
    if not label:
        return None
    if len(label) > 100:
        # cut at the last word boundary at or before 97 chars, not mid-word
        cut = label[:97]
        last_space = cut.rfind(" ")
        if last_space > 60:   # only back off if it doesn't eat more than a third of the budget
            cut = cut[:last_space]
        label = cut.rstrip().rstrip(",;") + "..."
    return label


def extract_tools(schemas_path: Path) -> dict[str, dict]:
    tree = ast.parse(schemas_path.read_text(encoding="utf-8"), filename=str(schemas_path))
    lists = _collect_top_level_lists(tree)
    order = _find_all_tools_member_order(tree)

    tools: dict[str, dict] = {}
    for list_name in order:
        for tool in lists.get(list_name, []):
            name = tool["name"]
            input_schema = tool.get("input_schema", {}) or {}
            properties = input_schema.get("properties", {}) or {}
            required = set(input_schema.get("required", []) or [])
            inputs = []
            for prop_name in properties.keys():
                prop_schema = properties.get(prop_name) or {}
                enum_vals = prop_schema.get("enum") if isinstance(prop_schema, dict) else None
                entry: dict = {"name": prop_name, "required": prop_name in required}
                if isinstance(enum_vals, list) and enum_vals:
                    entry["enum"] = [str(v) for v in enum_vals]
                inputs.append(entry)
            description = tool.get("description", "") or ""
            output_label = _derive_output_label(description)
            entry: dict = {"inputs": inputs}
            if output_label:
                entry["outputs"] = [output_label]
            else:
                entry["outputs"] = []
            entry["_source_list"] = list_name  # provenance, stripped before .ts authoring
            tools[name] = entry
    return tools


# ---------------------------------------------------------------------------
# Detectors: ~/vectoros/src/awareness/detectors/__init__.py
# ---------------------------------------------------------------------------

_EVAL_MODE_LABEL = {
    "clock": "clock-tick",
    "state": "state-write",
}


def extract_detectors(detectors_init_path: Path) -> dict[str, dict]:
    tree = ast.parse(detectors_init_path.read_text(encoding="utf-8"), filename=str(detectors_init_path))

    detectors: dict[str, dict] = {}
    for node in ast.walk(tree):
        # Find `DETECTOR_SPECS: tuple[...] = ( DetectorSpec(...), ... )`
        if not (
            isinstance(node, ast.AnnAssign)
            and isinstance(node.target, ast.Name)
            and node.target.id == "DETECTOR_SPECS"
        ) and not (
            isinstance(node, ast.Assign)
            and len(node.targets) == 1
            and isinstance(node.targets[0], ast.Name)
            and node.targets[0].id == "DETECTOR_SPECS"
        ):
            continue
        value = node.value
        if not isinstance(value, ast.Tuple):
            continue
        for call in value.elts:
            if not (isinstance(call, ast.Call) and isinstance(call.func, ast.Name) and call.func.id == "DetectorSpec"):
                continue
            # DetectorSpec(name, fn, urgency, event_class, eval_mode) — positional args.
            args = call.args
            if len(args) < 5:
                continue

            def literal_str(n: ast.AST) -> str:
                if isinstance(n, ast.Constant) and isinstance(n.value, str):
                    return n.value
                raise ValueError(f"Expected string literal, got {ast.dump(n)}")

            det_name = literal_str(args[0])
            # args[1] = fn (a Name reference, not a literal — skip)
            urgency = literal_str(args[2])
            event_class = literal_str(args[3])
            eval_mode = literal_str(args[4])

            input_label = _EVAL_MODE_LABEL.get(eval_mode, eval_mode)
            detectors[det_name] = {
                "inputs": [{"name": input_label}],
                "outputs": [event_class],
                "_urgency": urgency,  # provenance-only, not part of TaxoIO
            }
        break  # only one DETECTOR_SPECS assignment expected

    return detectors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--vectoros-root", type=Path, default=DEFAULT_VECTOROS_ROOT)
    args = parser.parse_args()

    schemas_path = args.vectoros_root / "src" / "tools" / "_schemas.py"
    detectors_path = args.vectoros_root / "src" / "awareness" / "detectors" / "__init__.py"

    if not schemas_path.is_file():
        print(f"ERROR: {schemas_path} not found", file=sys.stderr)
        return 1
    if not detectors_path.is_file():
        print(f"ERROR: {detectors_path} not found", file=sys.stderr)
        return 1

    tools = extract_tools(schemas_path)
    detectors = extract_detectors(detectors_path)

    result = {
        "tools": tools,
        "detectors": detectors,
        "meta": {
            "tool_count": len(tools),
            "detector_count": len(detectors),
            "source_schemas": str(schemas_path),
            "source_detectors": str(detectors_path),
        },
    }
    print(json.dumps(result, indent=2, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
