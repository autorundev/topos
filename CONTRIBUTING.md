# Contributing to AI Interaction Topos

Thank you for your interest in contributing to the AI Interaction Topos! This project aims to create a shared vocabulary for designing AI experiences, and we welcome contributions from the community.

## How to Contribute

### Suggesting New Patterns

The Topos is incomplete by design—AI interaction design is still forming as a discipline. If you have patterns, examples, or improvements to suggest:

1. **Check existing issues** - See if someone else has already suggested something similar
2. **Open an issue** - Use the "Pattern Suggestion" template to describe your proposed pattern
3. **Discuss** - Engage with maintainers and the community to refine the pattern
4. **Submit a PR** - Once the pattern is refined, submit a pull request

### Reporting Bugs

If you find a bug in the website or documentation:

1. **Check existing issues** - See if the bug has already been reported
2. **Open an issue** - Use the "Bug Report" template with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots if applicable

### Suggesting Features

Have an idea for improving the Topos?

1. **Open an issue** - Use the "Feature Request" template
2. **Describe the use case** - Explain what problem this solves
3. **Discuss alternatives** - What other approaches did you consider?

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/ai-interaction-topos.git
cd ai-interaction-topos

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see your changes.

### Making Changes

1. **Create a branch** - `git checkout -b feature/your-feature-name`
2. **Make your changes** - Edit files and test locally
3. **Test your changes** - Run `npm run build` to ensure production builds work
4. **Commit your changes** - Use clear, descriptive commit messages
5. **Push to your fork** - `git push origin feature/your-feature-name`
6. **Open a Pull Request** - Describe what you changed and why

## Project Structure

```
/data/              # Topos taxonomy data (tasks, constraints, touchpoints, etc.)
/features/          # Feature-based React components (topos, marketing, etc.)
/components/        # Shared React components
/src/               # Assets (images, etc.)
/types.ts           # TypeScript type definitions
```

## Adding New Patterns

Patterns are defined in `/data/` as TypeScript files:

- **AI Tasks** - `/data/ai_tasks.ts`
- **Human Tasks** - `/data/human_tasks.ts`
- **System Tasks** - `/data/system_tasks.ts`
- **Data Artifacts** - `/data/artifacts.ts`
- **Constraints** - `/data/constraints.ts`
- **Touchpoints** - `/data/touchpoints.ts`

Follow the existing structure and TypeScript types when adding new patterns.

### Pattern Admission Criteria

Not every useful concept earns a new top-level pattern. The Topos stays useful by staying small - every task it names should be one a designer can recognize, reach for, and distinguish from its neighbors. Before proposing a new **AI Task**, **Human Task**, or **System Task**, check it against the four conditions below. If it doesn't clear them, that usually doesn't mean the idea is wrong - it often means it belongs as guidance on an existing pattern, or as a workflow that composes existing ones.

**1. Grounding - can you name the capability it runs on?**

Every task names something a system or person actually *does*. For AI Tasks, the capability `tag` fields must map to a real model capability - we currently ground these in [HuggingFace task types](https://huggingface.co/tasks) (e.g. `sentence-similarity`, `feature-extraction`, `tabular-classification`). If you can't name the capability your task grounds in, that's the strongest signal it isn't a task. It may be a *situation* a designer finds themselves in, which they then handle with tasks that already exist.

**2. Dimensional uniqueness - is it distinct enough to stand alone?**

Plot your task against the existing tasks of its type across their discriminating dimensions (for AI Tasks: input cardinality, knowledge stance, output type, temporal scope, agency, human-signal dependency). A new task should share no more than half its dimensions with its nearest neighbor. Heavy overlap usually means the concept is a variant of something already named.

There is one exception: a task may exceed the overlap threshold if the dimensions on which it *does* diverge are the most design-consequential ones. A task that overlaps its neighbor on structural axes (how the work flows) but diverges on substantive axes (what it produces, what authority it carries) can still earn its place. Name the divergent dimensions explicitly and make the case that they carry the weight.

**3. Distinct failure mode - does it break in its own way?**

A pattern earns naming partly by failing in a way no existing pattern warns you about. Describe the specific way a system gets this wrong, and confirm no existing task already covers that failure. If the failure mode is the contribution but the operation isn't distinct, the failure mode can often land as an anti-pattern on the existing task instead (see below).

**4. Design conversation utility - does naming it change a decision?**

There should be a real moment where a team makes a *different* design choice because this pattern exists and is named. If you can describe that moment - "because we named X, we remembered to define Y" - the pattern is doing work. If naming it changes nothing a designer would do, it's documentation, not vocabulary.

#### When a concept doesn't clear the bar

A concept that fails these conditions still often carries real insight. Two common landing spots:

- **As an anti-pattern on an existing task** - if you found a genuine failure mode but the underlying operation isn't distinct, the warning belongs in the `ux_notes.anti_patterns` of the task a designer would otherwise misuse. The insight reaches people at the moment they'd make the mistake, which is often more useful than a separate pattern they'd have to discover.
- **As a workflow that composes existing tasks** - if your concept is really a sequence of existing tasks, it may be a composition pattern rather than a primitive. If that composition can be expressed without distorting any of its steps, the existing tasks already cover it.

The test that separates these from a true task: **does the decomposition into existing patterns distort, or merely compose?** If forcing the concept through existing tasks requires you to assume away the exact problem the concept exists to solve, that distortion is evidence of a genuine primitive. If the pieces fit cleanly, it's a composition.

#### Precedent

These conditions were established through review and are best understood through worked cases:

- **Harvest** (accepted) - discovering patterns from aggregate human decisions over time. Cleared dimensional uniqueness against its nearest neighbor on the most design-consequential axes. Required grounding its capability tags in real HuggingFace task types before merge - the original submission used descriptive labels, which is the most common first-time miss.
- **Delegate Authority** (accepted) - granting an AI agent bounded authority to act. Sat at the overlap threshold with its nearest neighbor but diverged on the substantive axes (what it transfers, what authority it carries), which is the heavy-divergence exception in practice.
- **Reconcile** (declined) - resolving conflicts between two equally-authoritative sources. Declined because it fails grounding: every model that resolves conflict collapses the symmetry into classification or ranking once trained, so "both sources are equals" is something the human brings to the situation, not an operation a model performs. Its real contribution - the silent-wrong-winner failure mode - landed instead as anti-patterns on the two tasks designers would otherwise misuse.

A concept that doesn't become a task is not a rejected contribution. In each case above, the insight reached the Topos - the question was only what *form* it should take.

## Code Style

- Use TypeScript for all new code
- Follow existing code formatting (Prettier/ESLint config)
- Keep components focused and single-purpose
- Add comments for complex logic
- Use descriptive variable and function names

## Pull Request Guidelines

- Keep PRs focused - one feature/fix per PR
- Write clear PR descriptions explaining what and why
- Reference related issues (e.g., "Closes #123")
- Be responsive to feedback and questions
- Ensure the build passes before requesting review

## Community Guidelines

- Be respectful and inclusive
- Assume good intent
- Provide constructive feedback
- Help others learn and grow
- Keep discussions focused and on-topic

## Questions?

If you have questions about contributing:

- Open a [GitHub Discussion](https://github.com/quietloudlab/ai-interaction-topos/discussions)
- Email: brandon@quietloudlab.com

## License

By contributing to the AI Interaction Topos, you agree that your contributions will be licensed under the Apache License 2.0.

---

**Thank you for helping build a shared language for AI interaction design!** 🗺️
