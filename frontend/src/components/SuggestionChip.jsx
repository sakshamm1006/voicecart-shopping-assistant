function SuggestionChip({ suggestion, onAccept, onDismiss }) {
  const { name, count, daysAgo } = suggestion;
  const when =
    daysAgo <= 0 ? 'earlier today' : daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`;

  return (
    <div className="suggestion-chip">
      <button className="suggestion-add" onClick={() => onAccept(suggestion)}>
        <span className="suggestion-name">+ {name}</span>
        <span className="suggestion-meta">
          Added {count}× · last {when}
        </span>
      </button>
      <button
        className="suggestion-dismiss"
        onClick={() => onDismiss(name)}
        aria-label={`Dismiss ${name}`}
      >
        ✕
      </button>
    </div>
  );
}

export default SuggestionChip;