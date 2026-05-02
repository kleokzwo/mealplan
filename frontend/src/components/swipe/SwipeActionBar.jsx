import { RefreshCcw, X, Heart } from "lucide-react";

export default function SwipeActionBar({
  onReject,
  onLike,
  onRefresh,
  disableRefresh = false,
}) {
  return (
    <div className="mt-5 flex items-center justify-center gap-4">
      <button
        data-testid="swipe-dislike"
        type="button"
        onClick={onReject}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition active:scale-95"
      >
        <X className="h-5 w-5" />
      </button>

      <button
        data-testid="swipe-card"
        type="button"
        onClick={onRefresh}
        disabled={disableRefresh}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition active:scale-95 disabled:opacity-40"
      >
        <RefreshCcw className="h-5 w-5" />
      </button>

      <button
        data-testid="swipe-like"
        type="button"
        onClick={onLike}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition active:scale-95"
      >
        <Heart className="h-5 w-5" />
      </button>
    </div>
  );
}