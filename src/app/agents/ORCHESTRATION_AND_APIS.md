# Orchestration, APIs, and LangGraph

This doc clarifies how the multi-step flow (CD → PM → Studio Coordinator) relates to **orchestration**, **APIs** (Supabase, LLM), and **LangGraph**.

---

## 1. We do have multiple steps (orchestration)

The flow is:

1. **Intake** (quiz) → answers, project metadata, room list  
2. **Creative Director** → candidates per slot + pairing rules  
3. **Project Manager** → one product per slot + scopeReasoning  
4. **Studio Coordinator** → renders Design Detail (moodboards, Decision Details table)

That *is* orchestration: multiple steps in a defined order. Right now we implement it in **application code** (e.g. on “Create Designs” click: run CD, then PM, save result, navigate; the Design Concept page reads the saved result and the Studio Coordinator is “the page that renders it”).

**LangGraph** is one way to implement the same orchestration: you define a **graph** with a shared **state** and **nodes** (e.g. “CD node”, “PM node”). The graph runs the nodes in order (or with conditional edges) and passes state between them. So:

- **Without LangGraph**: orchestration = your code (e.g. `runCreativeDirector()` then `runProjectManagerSelection()` then `setDesignConceptOutput()`).
- **With LangGraph**: orchestration = the graph (e.g. `state` → CD node → `state` → PM node → `state` → end; your CD/PM logic runs inside the nodes).

So we *do* have orchestration; LangGraph is **optional** and mainly useful when you want the graph abstraction (state, conditional branches, human-in-the-loop, or reuse of the same flow from different entry points).

---

## 2. Supabase does **not** require LangGraph

If the **Creative Director** (or a product data layer) needs to read from **Supabase** (e.g. `master_products`), you need a way to call Supabase from your app:

- **Option A – Client-side**: Use the Supabase JS client in the browser. Works with Row Level Security (RLS); you don’t expose the service role.
- **Option B – Server-side**: Use a **Next.js API route** or **Server Action** that uses the Supabase client on the server and returns products (or filtered candidates). This is a normal HTTP/function API, **not** LangGraph.

So:

- **Supabase** → you need a way to call it (client or **your own API route**).
- **LangGraph** → not required for Supabase. You’d call Supabase from inside a CD node *if* you adopt LangGraph, but the same call could live in a plain API route or in `getCandidatesForSlot()` in a server action.

---

## 3. LLM does **not** require LangGraph

If the **CD** or **PM** use an **LLM** (e.g. for style reasoning, product ranking, or natural-language explanations), that’s an **API call** (e.g. to OpenAI, Anthropic, or your own model endpoint). You can:

- Call the LLM from a **Next.js API route** or **Server Action** (e.g. “Create Designs” triggers a route that runs CD logic, calls the LLM inside it, then runs PM, then returns the result).
- Or, if you use **LangGraph**, put the LLM inside a **node** (e.g. “CD node” calls the LLM to refine candidates or explain style). The graph then orchestrates when that node runs and what state it gets.

So:

- **LLM** → you need an API to the model (your route or the provider’s SDK). That’s just “we call an API”; no LangGraph required.
- **LangGraph** → useful if you want the LLM to be one step in a multi-step graph (with state, branching, or loops), not because “we use an API.”

---

## 4. When to add what

| Goal | What you need |
|------|----------------|
| Investment range and Design Detail reflect quiz | ✅ Done in app: use `getInvestmentRangeLabel(answers)` and pass it into the summary (placeholder and agent output). |
| Multiple steps (CD → PM → Studio Coordinator) | ✅ Already orchestrated in code (button → CD → PM → store → render). |
| Supabase for product data | Add a **data layer** that calls Supabase (client or **API route** / Server Action). No LangGraph required. |
| LLM for CD or PM | Add **LLM calls** inside your CD/PM logic (e.g. in an **API route** or Server Action that “Create Designs” calls). No LangGraph required. |
| Graph-based orchestration (state, branching, loops) | Add **LangGraph**: define state, CD node, PM node, and optionally LLM inside nodes; “Create Designs” invokes the graph and then uses the final state (e.g. `pmOutput`) as today. |

**Summary**

- **APIs**: You’ll use them for Supabase (if server-side) and for any LLM. Those are normal Next.js routes or Server Actions.
- **LangGraph**: Use it when you want the flow (CD → PM → Studio Coordinator) to be a **graph** with shared state and optional branching, not because Supabase or the LLM “require” it.
