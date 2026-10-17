import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';

const ITEMS_KEY = 'voicecart:list';
const HISTORY_KEY = 'voicecart:history';

// Suggestion tuning
const MIN_ADDS = 2; // an item must have been added at least this many times
const MAX_SUGGESTIONS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

function loadItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(ITEMS_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  } catch {
    return {};
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked: the app still works for this session
  }
}

const normalize = (s) => s.trim().toLowerCase();

const withFeedback = (state, kind, text) => ({
  ...state,
  feedback: { kind, text, n: state.feedback.n + 1 },
});

function recordAdd(history, { name, category, unit }) {
  const prev = history[name];
  return {
    ...history,
    [name]: {
      name,
      category: category || prev?.category || 'Other',
      unit: unit ?? prev?.unit ?? null,
      count: (prev?.count ?? 0) + 1,
      lastAdded: Date.now(),
    },
  };
}

function addItem(state, { name, quantity, unit, category }) {
  const existing = state.items.find((i) => i.name === name);
  const history = recordAdd(state.history, { name, category, unit });

  if (existing) {
    const items = state.items.map((i) =>
      i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i
    );
    return withFeedback(
      { ...state, items, history },
      'success',
      `Updated ${name}: now ${existing.quantity + quantity}`
    );
  }

  const items = [
    ...state.items,
    {
      id: crypto.randomUUID(),
      name,
      quantity,
      unit: unit ?? null,
      category: category || 'Other',
    },
  ];
  return withFeedback(
    { ...state, items, history },
    'success',
    `Added ${quantity > 1 ? `${quantity} ` : ''}${name}`
  );
}

function reducer(state, action) {
  switch (action.type) {
    case 'intent': {
      const { intent, item, quantity, unit, category } = action.parsed;
      const name = item ? normalize(item) : null;
      const existing = name ? state.items.find((i) => i.name === name) : null;

      if (intent === 'add' && name) {
        return addItem(state, { name, quantity: quantity ?? 1, unit, category });
      }

      if (intent === 'remove' && name) {
        if (!existing) return withFeedback(state, 'error', `${name} isn't on your list`);
        const items = state.items.filter((i) => i.id !== existing.id);
        return withFeedback({ ...state, items }, 'success', `Removed ${name}`);
      }

      if (intent === 'modify' && name) {
        if (!existing) return withFeedback(state, 'error', `${name} isn't on your list`);
        if (quantity == null) {
          return withFeedback(state, 'error', 'Tell me the new quantity, e.g. "change milk to 3"');
        }
        const items = state.items.map((i) =>
          i.id === existing.id ? { ...i, quantity, unit: unit ?? i.unit } : i
        );
        return withFeedback({ ...state, items }, 'success', `${name} set to ${quantity}`);
      }

      if (intent === 'search') {
        return withFeedback(state, 'info', 'Voice search is coming soon');
      }

      return withFeedback(state, 'error', "Sorry, I didn't catch that as a shopping command");
    }

    case 'remove_id':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };

    case 'accept_suggestion': {
      const { name, unit, category } = action.suggestion;
      return addItem(state, { name, quantity: 1, unit, category });
    }

    case 'dismiss_suggestion':
      return { ...state, dismissed: [...state.dismissed, action.name] };

    default:
      return state;
  }
}

export function useShoppingList() {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    items: loadItems(),
    history: loadHistory(),
    dismissed: [],
    feedback: { kind: 'info', text: '', n: 0 },
  }));
  const [now] = useState(Date.now);

  useEffect(() => save(ITEMS_KEY, state.items), [state.items]);
  useEffect(() => save(HISTORY_KEY, state.history), [state.history]);

  // Frequently added items that aren't on the list right now
  const suggestions = useMemo(() => {
    const onList = new Set(state.items.map((i) => i.name));
    const dismissed = new Set(state.dismissed);
    return Object.values(state.history)
      .filter((h) => h.count >= MIN_ADDS && !onList.has(h.name) && !dismissed.has(h.name))
      .sort((a, b) => b.count - a.count || a.lastAdded - b.lastAdded)
      .slice(0, MAX_SUGGESTIONS)
      .map((h) => ({ ...h, daysAgo: Math.floor((now - h.lastAdded) / DAY_MS) }));
  }, [state.items, state.history, state.dismissed, now]);

  const applyIntent = useCallback((parsed) => dispatch({ type: 'intent', parsed }), []);
  const removeItem = useCallback((id) => dispatch({ type: 'remove_id', id }), []);
  const acceptSuggestion = useCallback(
    (suggestion) => dispatch({ type: 'accept_suggestion', suggestion }),
    []
  );
  const dismissSuggestion = useCallback(
    (name) => dispatch({ type: 'dismiss_suggestion', name }),
    []
  );

  return {
    items: state.items,
    feedback: state.feedback,
    suggestions,
    applyIntent,
    removeItem,
    acceptSuggestion,
    dismissSuggestion,
  };
}