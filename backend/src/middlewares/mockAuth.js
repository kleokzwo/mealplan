export function mockAuth(req, res, next) {
  req.user = {
    id: 1,
    email: "test@test.de",
    notificationPreference: "täglich",
  };

  next();
}