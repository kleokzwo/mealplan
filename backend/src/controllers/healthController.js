export const getHealth = (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'familien-autopilot-api',
    timestamp: new Date().toISOString(),
  });
};
