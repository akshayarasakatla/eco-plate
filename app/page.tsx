"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Priority = "High" | "Medium" | "Low";
type Filter = "all" | "active" | "done";

interface TodoItem {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  done: boolean;
}

const STORAGE_KEY = "ecoplate_todos_v1";

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
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
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
    </>
  );
}