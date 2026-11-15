"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const TODO_STORAGE_KEY = "ecoplate_todos_v1";
const PANTRY_STORAGE_KEY = "ecoplate_pantry_v1";

type Priority = "High" | "Medium" | "Low";
type TodoFilter = "all" | "active" | "done";

interface TodoItem {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  done: boolean;
}

const DEFAULT_TODOS: TodoItem[] = [
  { id: "1", title: "Use up spinach before it wilts", category: "Use Soon", priority: "High", done: false },
  { id: "2", title: "Buy olive oil and garlic", category: "Shopping", priority: "Medium", done: false },
  { id: "3", title: "Prep chicken marinade for dinner", category: "Meal Prep", priority: "Low", done: true },
];

export default function HomePage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Shopping");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [filter, setFilter] = useState<TodoFilter>("all");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TODO_STORAGE_KEY);
      setTodos(raw ? JSON.parse(raw) : DEFAULT_TODOS);
    } catch {
      setTodos(DEFAULT_TODOS);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // ignore storage errors
    }
  }, [todos, loaded]);

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setTodos((prev) => [
      {
        id: String(Date.now()),
        title: trimmed,
        category,
        priority,
        done: false,
      },
      ...prev,
    ]);
    setTitle("");
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((item) => !item.done));
  }

  const visibleTodos = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.done);
    if (filter === "done") return todos.filter((t) => t.done);
    return todos;
  }, [todos, filter]);

  const remainingCount = todos.filter((t) => !t.done).length;
  const completedCount = todos.length - remainingCount;

  function priorityTagClass(p: Priority) {
    if (p === "High") return "tag tag-bad";
    if (p === "Medium") return "tag tag-warn";
    return "tag tag-ok";
  }

  return (
    <>
      <section className="page-head">
        <h1>Kitchen To-Do</h1>
        <p className="muted">
          Track grocery runs, meal prep steps, and ingredients to use first.
        </p>
      </section>

      <form className="card add-form" onSubmit={handleAdd}>
        <label className="grow">
          Task
          <input
            type="text"
            placeholder="e.g., Buy fresh basil or prep lunch boxes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
          />
        </label>

        <label>
          Type
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Shopping">Shopping</option>
            <option value="Meal Prep">Meal Prep</option>
            <option value="Use Soon">Use Soon</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label>
          Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </label>

        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>

      <div className="toolbar" style={{ justifyContent: "space-between" }}>
        <div className="chips" role="tablist" aria-label="Filter tasks">
          <button
            type="button"
            className={`chip ${filter === "all" ? "on" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({todos.length})
          </button>
          <button
            type="button"
            className={`chip ${filter === "active" ? "on" : ""}`}
            onClick={() => setFilter("active")}
          >
            Active ({remainingCount})
          </button>
          <button
            type="button"
            className={`chip ${filter === "done" ? "on" : ""}`}
            onClick={() => setFilter("done")}
          >
            Done ({completedCount})
          </button>
        </div>

        {completedCount > 0 && (
          <button type="button" className="btn btn-small" onClick={clearCompleted}>
            Clear completed
          </button>
        )}
      </div>

      {!loaded ? (
        <p className="muted">Loading your tasks…</p>
      ) : visibleTodos.length === 0 ? (
        <div className="card empty">
          <p>
            {todos.length === 0
              ? "No tasks yet. Add your first grocery or prep item above."
              : "No tasks match this filter."}
          </p>
        </div>
      ) : (
        <ul className="list">
          {visibleTodos.map((item) => (
            <li key={item.id} className={`card todo ${item.done ? "is-done" : ""}`}>
              <input
                type="checkbox"
                className="check"
                checked={item.done}
                onChange={() => toggleTodo(item.id)}
                aria-label={`Mark "${item.title}" as ${item.done ? "incomplete" : "complete"}`}
              />

              <div className="todo-body">
                <h3>{item.title}</h3>
                <div className="tags">
                  <span className="tag tag-pantry">{item.category}</span>
                  <span className={priorityTagClass(item.priority)}>
                    {item.priority} priority
                  </span>
                </div>
              </div>

              <div className="todo-actions">
                <button
                  type="button"
                  className="btn btn-small"
                  onClick={() => deleteTodo(item.id)}
                  aria-label={`Delete ${item.title}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="section-gap">
        <PantryPage />
      </div>
    </>
  );
}

const CATEGORIES = ["produce", "dairy", "protein", "pantry", "frozen", "other"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_LABELS: Record<Category, string> = {
  produce: "Produce",
  dairy: "Dairy",
  protein: "Protein",
  pantry: "Pantry",
  frozen: "Frozen",
  other: "Other",
};

interface PantryItem {
  id: number | string;
  name: string;
  category: Category;
  quantity: number;
  unit: string;
  expires_on: string | null;
}

interface Suggestions {
  shopping_list: {
    ingredient: string;
    unlocks: string[];
  }[];
  recipes: {
    id: number | string;
    title: string;
    emoji: string;
    can_make: boolean;
    have: string[];
    missing: string[];
    steps: string[];
  }[];
}

function emojiFor(name: string, category: Category): string {
  const n = name.toLowerCase();
  if (n.includes("egg")) return "🥚";
  if (n.includes("milk")) return "🥛";
  if (n.includes("cheese")) return "🧀";
  if (n.includes("bread")) return "🍞";
  if (n.includes("chicken")) return "🍗";
  if (n.includes("apple")) return "🍎";
  if (n.includes("banana")) return "🍌";
  if (n.includes("tomato")) return "🍅";
  if (n.includes("rice") || n.includes("pasta")) return "🍝";

  const fallbacks: Record<Category, string> = {
    produce: "🥬",
    dairy: "🥛",
    protein: "🥩",
    pantry: "🥫",
    frozen: "🧊",
    other: "🍽️",
  };
  return fallbacks[category] ?? "🍽️";
}

type PantryFilter = "all" | Category;

function expiryBadge(iso: string | null): { label: string; tone: "bad" | "warn" } | null {
  if (!iso) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((new Date(`${iso}T00:00:00`).getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return { label: "Expired", tone: "bad" };
  if (days === 0) return { label: "Expires today", tone: "bad" };
  if (days <= 3) return { label: `Use within ${days}d`, tone: "warn" };
  return null;
}

function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [suggestions] = useState<Suggestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PantryFilter>("all");

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("produce");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("");
  const [expires, setExpires] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PANTRY_STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // ignore storage errors
    } finally {
      setLoading(false);
    }
  }, []);

  function saveItems(updater: (prev: PantryItem[]) => PantryItem[]) {
    setItems((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }

  function onAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    saveItems((prev) => [
      {
        id: Date.now(),
        name: name.trim(),
        category,
        quantity: Number(quantity) || 1,
        unit: unit.trim(),
        expires_on: expires || null,
      },
      ...prev,
    ]);

    setName("");
    setQuantity("1");
    setUnit("");
    setExpires("");
  }

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );
  const usedCategories = useMemo(
    () => CATEGORIES.filter((c) => items.some((i) => i.category === c)),
    [items],
  );
  const expiringSoon = items.filter((i) => expiryBadge(i.expires_on)).length;

  return (
    <>
      <section className="page-head">
        <h1>Your Pantry</h1>
        <p className="muted">
          Track what you have, spot what&apos;s about to expire, and see what you can cook — or what to grab next.
        </p>
      </section>

      <form className="card add-form" onSubmit={onAdd}>
        <label className="grow">
          Ingredient
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. eggs" maxLength={80} required />
        </label>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="narrow">
          Qty
          <input type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </label>
        <label className="narrow">
          Unit
          <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="pcs" maxLength={20} />
        </label>
        <label>
          Expires
          <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
        </label>
        <button className="btn btn-primary">Add</button>
      </form>

      <div className="chips" role="tablist" aria-label="Filter by category">
        <button className={`chip ${filter === "all" ? "on" : ""}`} onClick={() => setFilter("all")}>
          All ({items.length})
        </button>
        {usedCategories.map((c) => (
          <button key={c} className={`chip tag-${c} ${filter === c ? "on" : ""}`} onClick={() => setFilter(c)}>
            {CATEGORY_LABELS[c]}
          </button>
        ))}
        {expiringSoon > 0 && <span className="tag tag-warn">⏳ {expiringSoon} to use soon</span>}
      </div>

      {loading ? (
        <p className="muted">Loading your pantry…</p>
      ) : visible.length === 0 ? (
        <div className="card empty">
          <p>Nothing here yet. Add the stuff in your mini-fridge and cupboard above.</p>
        </div>
      ) : (
        <div className="grid">
          {visible.map((item) => {
            const badge = expiryBadge(item.expires_on);
            return (
              <article key={item.id} className={`card item ${item.quantity === 0 ? "faded" : ""}`}>
                <div className="item-top">
                  <span className="emoji" aria-hidden>
                    {emojiFor(item.name, item.category)}
                  </span>
                  <button
                    className="icon-btn"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => saveItems((prev) => prev.filter((i) => i.id !== item.id))}
                  >
                    ✕
                  </button>
                </div>
                <h3>{item.name}</h3>
                <div className="tags">
                  <span className={`tag tag-${item.category}`}>{CATEGORY_LABELS[item.category] ?? "Other"}</span>
                  {badge && <span className={`tag tag-${badge.tone}`}>{badge.label}</span>}
                </div>
                {item.expires_on && <p className="muted small">Expires {item.expires_on}</p>}
                <div className="qty">
                  <button
                    className="icon-btn"
                    aria-label={`Use one ${item.name}`}
                    disabled={item.quantity <= 0}
                    onClick={() =>
                      saveItems((prev) =>
                        prev.map((i) => (i.id === item.id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i)),
                      )
                    }
                  >
                    −
                  </button>
                  <span>
                    {item.quantity} {item.unit}
                  </span>
                  <button
                    className="icon-btn"
                    aria-label={`Add one ${item.name}`}
                    onClick={() =>
                      saveItems((prev) =>
                        prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)),
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {suggestions && (
        <>
          <section className="page-head section-gap">
            <h2>What you can make</h2>
            <p className="muted">Matched against simple 3-ingredient meals using what&apos;s in your pantry.</p>
          </section>

          {suggestions.shopping_list.length > 0 && (
            <div className="card shopping">
              <h3>Pick up next</h3>
              <ul>
                {suggestions.shopping_list.map((s) => (
                  <li key={s.ingredient}>
                    <strong>{s.ingredient}</strong> <span className="muted">unlocks {s.unlocks.join(", ")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid recipes">
            {suggestions.recipes.map((r) => (
              <article key={r.id} className={`card recipe ${r.can_make ? "ready" : ""}`}>
                <div className="item-top">
                  <span className="emoji" aria-hidden>
                    {r.emoji}
                  </span>
                  {r.can_make ? (
                    <span className="tag tag-ok">Ready to cook</span>
                  ) : (
                    <span className="tag tag-warn">Missing {r.missing.length}</span>
                  )}
                </div>
                <h3>{r.title}</h3>
                <div className="tags">
                  {r.have.map((i) => (
                    <span key={i} className="tag tag-ok">
                      ✓ {i}
                    </span>
                  ))}
                  {r.missing.map((i) => (
                    <span key={i} className="tag tag-miss">
                      + {i}
                    </span>
                  ))}
                </div>
                <details>
                  <summary>Steps</summary>
                  <ol>
                    {r.steps.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ol>
                </details>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}