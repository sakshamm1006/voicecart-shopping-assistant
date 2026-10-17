import ListItem from './ListItem';

const CATEGORIES = [
  ['Produce', '🥬'],
  ['Dairy', '🥛'],
  ['Bakery', '🍞'],
  ['Meat & Fish', '🥩'],
  ['Pantry', '🥫'],
  ['Snacks', '🍿'],
  ['Beverages', '🥤'],
  ['Household', '🧽'],
  ['Personal Care', '🧴'],
  ['Other', '🛒'],
];
const KNOWN = CATEGORIES.map(([name]) => name);

function ShoppingList({ items, onRemove }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">Your list is empty. Tap the mic and say “Add milk”.</div>
    );
  }

  // Anything the LLM labels with an unexpected category falls into "Other"
  const grouped = items.reduce((acc, item) => {
    const cat = KNOWN.includes(item.category) ? item.category : 'Other';
    (acc[cat] ||= []).push(item);
    return acc;
  }, {});

  return (
    <div className="shopping-list">
      {CATEGORIES.filter(([name]) => grouped[name]).map(([name, icon]) => (
        <section className="category" key={name}>
          <h2 className="category-title">
            <span>{icon}</span>
            {name}
          </h2>
          <ul>
            {grouped[name].map((item) => (
              <ListItem key={item.id} item={item} onRemove={onRemove} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default ShoppingList;