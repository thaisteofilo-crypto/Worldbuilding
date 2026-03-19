# Subagents Report — Changelog History

## Status Legend

| Status | Meaning |
|--------|---------|
| COMPLETE (reason) | Action was taken and resolved successfully |
| INVALID (reason) | Finding was incorrect, not applicable, or intentional |
| ON HOLD (reason) | Action deferred — waiting on external dependency or user decision |

---

## [2026-02-28 03:22 PM PKT] Claude Code v2.1.63

| # | Priority | Type | Action | Status |
|---|----------|------|--------|--------|
| 1 | HIGH | Agents Table | Add `workflow-changelog-claude-agents-frontmatter-agent` to Agents in This Repository table | COMPLETE (added with model: opus, inherits all tools, no skills/memory) |
| 2 | HIGH | Agents Table | Fix presentation-curator skills column — add `presentation/` prefix to skill names | COMPLETE (updated to presentation/vibe-to-agentic-framework etc.) |
| 3 | MED | Field Documentation | Add note to `color` field that it is functional but absent from official frontmatter table | COMPLETE (added note about unofficial status in description column) |
| 4 | MED | Invocation Section | Expand invocation section with --agents CLI flag, /agents command, claude agents CLI, agent resumption | COMPLETE (added invocation methods table with 5 methods) |
