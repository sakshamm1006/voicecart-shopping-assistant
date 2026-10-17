function ListItem({ item, onRemove }) {
  return (
    <li className="list-item">
      <span className="item-name">{item.name}</span>
      <span className="item-qty">
        ×{item.quantity}
        {item.unit ? ` ${item.unit}` : ''}
      </span>
      <button
        className="remove-btn"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.name}`}
      >
        ✕
      </button>
    </li>
  );
}

export default ListItem;