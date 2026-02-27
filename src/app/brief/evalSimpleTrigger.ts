// src/app/brief/evalSimpleTrigger.ts
// Shared trigger evaluator for Revy rules (BU, FN, FS). Used by brief page and concept brief.

/**
 * Minimal trigger evaluator for rule strings like:
 * - "ownership_mode == rental"
 * - "finish_level == builder_plus AND budget_fit == aligned"
 * - "rooms include kitchen"
 * Supported: AND / OR, ==, !=, >=, <=, >, <, include/includes/contains.
 */
export function evalSimpleTrigger(expr: string, ctx: Record<string, unknown>): boolean {
  const tokens = expr.replace(/\s+/g, " ").trim().split(" ");

  const readValue = (t: string) => {
    if (t in ctx) return ctx[t];
    const unquoted =
      t.length >= 2 &&
      ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"')))
        ? t.slice(1, -1)
        : t;
    const n = Number(unquoted);
    if (!Number.isNaN(n)) return n;
    return unquoted;
  };

  const asArraySafe = (v: unknown): unknown[] => {
    if (Array.isArray(v)) return v;
    if (v == null) return [];
    return [v];
  };

  const evalComparison = (left: string, opRaw: string, right: string) => {
    const op = opRaw === "=" ? "==" : opRaw;
    const a = readValue(left);
    const b = readValue(right);

    if (op === "include" || op === "includes" || op === "contains") {
      const arr = asArraySafe(a).map(String);
      if (String(b).toLowerCase() === "bathroom") {
        return arr.some((x) => x.includes("bath"));
      }
      return arr.includes(String(b));
    }

    switch (op) {
      case "==":
        return String(a) === String(b);
      case "!=":
        return String(a) !== String(b);
      case ">=":
        return Number(a) >= Number(b);
      case "<=":
        return Number(a) <= Number(b);
      case ">":
        return Number(a) > Number(b);
      case "<":
        return Number(a) < Number(b);
      default:
        return false;
    }
  };

  const parts: (boolean | "AND" | "OR")[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "AND" || t === "OR") {
      parts.push(t);
      continue;
    }
    const left = tokens[i];
    const op = tokens[i + 1];
    const right = tokens[i + 2];
    if (!left || !op || !right) break;
    parts.push(evalComparison(left, op, right));
    i += 2;
  }

  const andReduced: (boolean | "OR")[] = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p === "AND") {
      const prev = andReduced.pop();
      const next = parts[i + 1];
      if (typeof prev === "boolean" && typeof next === "boolean") {
        andReduced.push(prev && next);
        i += 1;
      } else {
        andReduced.push(false);
      }
    } else {
      andReduced.push(p as boolean | "OR");
    }
  }

  let result = false;
  for (const p of andReduced) {
    if (p === "OR") continue;
    result = result || Boolean(p);
  }
  return result;
}
