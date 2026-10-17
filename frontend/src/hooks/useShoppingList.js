import { useCallback, useEffect, useReducer } from 'react';

const STORAGE_KEY = 'voicecart:list';

function loadItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

const normalize = (s) => s.trim().toLowerCase();

function reducer(state, action) {
  const say = (kind, text, items = state.items) => ({
    items,
    feedback: { kind, text, n: state.feedback.n + 1 },
  });

  switch (action.type) {
    case 'intent': {
      const { intent, item, quantity, unit, category } = action.parsed;
      const name = item ? normalize(item) : null;
      const existing = name ? state.items.find((i) => i.name === name) : null;

      if (intent === 'add' && name) {
        const qty = quantity ?? 1;
        if (existing) {
          const items = state.items.map((i) =>
            i.id === existing.id ? { ...i, quantity: i.quantity + qty } : i
          );
          return say('success', `Updated ${name}: now ${existing.quantity + qty}`, items);
        }
        const items = [
          ...state.items,
          {
            id: crypto.randomUUID(),
            name,
            quantity: qty,
            unit: unit ?? null,
            category: category || 'Other',
          },
        ];
        return say('success', `Added ${qty > 1 ? `${qty} ` : ''}${name}`, items);
      }

      if (intent === 'remove' && name) {
        if (!existing) return say('error', `${name} isn't on your list`);
        const items = state.items.filter((i) => i.id !== existing.id);
        return say('success', `Removed ${name}`, items);
      }

      if (intent === 'modify' && name) {
        if (!existing) return say('error', `${name} isn't on your list`);
        if (quantity == null) {
          return say('error', 'Tell me the new quantity, e.g. "change milk to 3"');
        }
        const items = state.items.map((i) =>
          i.id === existing.id ? { ...i, quantity, unit: unit ?? i.unit } : i
        );
        return say('success', `${name} set to ${quantity}`, items);
      }

      if (intent === 'search') {
        return say('info', 'Voice search is coming soon');
      }

      return say('error', "Sorry, I didn't catch that as a shopping command");
    }

    case 'remove_id': {
      const items = state.items.filter((i) => i.id !== action.id);
      return { ...state, items };
    }

    default:
      return state;
  }
}

export function useShoppingList() {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    items: loadItems(),
    feedback: { kind: 'info', text: '', n: 0 },
  }));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // storage full or blocked: the list still works for this session
    }
  }, [state.items]);

  const applyIntent = useCallback((parsed) => dispatch({ type: 'intent', parsed }), []);
  const removeItem = useCallback((id) => dispatch({ type: 'remove_id', id }), []);

  return { items: state.items, feedback: state.feedback, applyIntent, removeItem };
}