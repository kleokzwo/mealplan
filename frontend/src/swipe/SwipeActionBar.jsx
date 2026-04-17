function SwipeActionBar({ onLike, onSkip }) {
  return (
    <div className="swipe-action-bar">
      <button type="button" className="action-button secondary" onClick={onSkip}>
        Nein
      </button>
      <button type="button" className="action-button primary" onClick={onLike}>
        Passt
      </button>
    </div>
  );
}

export default SwipeActionBar;
