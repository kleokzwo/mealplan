import { motion, useMotionValue, useTransform } from 'framer-motion';

const SWIPE_THRESHOLD = 110;

function SwipeRecipeCard({ meal, onLike, onSkip }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-12, 12]);
  const likeOpacity = useTransform(x, [0, 60, 140], [0, 0.4, 1]);
  const skipOpacity = useTransform(x, [-140, -60, 0], [1, 0.4, 0]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onLike();
      return;
    }

    if (info.offset.x < -SWIPE_THRESHOLD) {
      onSkip();
      return;
    }

    x.set(0);
  };

  return (
    <motion.article
      className="swipe-card active-card"
      style={{ x, rotate }}
      drag="x"
      dragElastic={0.18}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.99 }}
    >
      <motion.div className="swipe-indicator like" style={{ opacity: likeOpacity }}>
        Passt
      </motion.div>
      <motion.div className="swipe-indicator skip" style={{ opacity: skipOpacity }}>
        Nein
      </motion.div>

      <div className="card-media">
        <span className="meal-badge">{meal.category}</span>
        <div className="card-media-overlay">
          <p className="meal-type">{meal.dietType}</p>
          <h3>{meal.title}</h3>
        </div>
      </div>

      <div className="card-content">
        <div className="meal-meta-grid">
          <div>
            <span className="meta-label">Kochzeit</span>
            <strong>{meal.cookingTimeMinutes} Min.</strong>
          </div>
          <div>
            <span className="meta-label">Schwierigkeit</span>
            <strong>{meal.difficulty}</strong>
          </div>
          <div>
            <span className="meta-label">Haushalt</span>
            <strong>{meal.householdFit || 'familienfreundlich'}</strong>
          </div>
          <div>
            <span className="meta-label">Ideal für</span>
            <strong>{meal.familyFit || 'Alltag'}</strong>
          </div>
        </div>

        <p className="card-tip">
          Swipe rechts für Wochenplan. Swipe links für einen neuen Vorschlag.
        </p>
      </div>
    </motion.article>
  );
}

export default SwipeRecipeCard;
