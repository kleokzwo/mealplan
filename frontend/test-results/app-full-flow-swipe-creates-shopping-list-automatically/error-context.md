# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.js >> full flow: swipe creates shopping list automatically
- Location: e2e/app.spec.js:75:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('swipe-like')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByTestId('swipe-like')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - heading "Einloggen" [level=1] [ref=e4]
  - paragraph [ref=e5]: Schön, dass du wieder da bist.
  - generic [ref=e6]:
    - generic [ref=e7]:
      - generic [ref=e8]: E-Mail
      - textbox "name@beispiel.de" [ref=e9]
    - generic [ref=e10]:
      - generic [ref=e11]: Passwort
      - textbox "Dein Passwort" [ref=e12]
    - button "Einloggen" [ref=e13] [cursor=pointer]
  - generic [ref=e14]:
    - text: Noch kein Konto?
    - link "Konto erstellen" [ref=e15] [cursor=pointer]:
      - /url: /register
```

# Test source

```ts
  2   | 
  3   | const API_URL = 'http://localhost:4000';
  4   | 
  5   | test('redirects logged-out user to login', async ({ page }) => {
  6   |   await page.goto('/');
  7   |   await expect(page).toHaveURL(/login/);
  8   | });
  9   | 
  10  | test('login page renders', async ({ page }) => {
  11  |   await page.goto('/login');
  12  | 
  13  |   await expect(page.getByTestId('login-email')).toBeVisible();
  14  |   await expect(page.getByTestId('login-password')).toBeVisible();
  15  |   await expect(page.getByTestId('login-submit')).toBeVisible();
  16  | });
  17  | 
  18  | test('register page renders', async ({ page }) => {
  19  |   await page.goto('/register');
  20  | 
  21  |   await expect(page.getByTestId('register-email')).toBeVisible();
  22  |   await expect(page.getByTestId('register-password')).toBeVisible();
  23  |   await expect(page.getByTestId('register-submit')).toBeVisible();
  24  | });
  25  | 
  26  | test('user is redirected to verify email after register', async ({ page, request }) => {
  27  |   const email = `verify-${Date.now()}@example.com`;
  28  | 
  29  |   try {
  30  |     await page.goto('/register');
  31  | 
  32  |     const nameInput = page.getByTestId('register-name');
  33  |     if (await nameInput.count()) {
  34  |       await nameInput.fill('Test User');
  35  |     }
  36  | 
  37  |     await page.getByTestId('register-email').fill(email);
  38  |     await page.getByTestId('register-password').fill('TestPassword123!');
  39  |     await page.getByTestId('register-submit').click();
  40  | 
  41  |     await expect(page).toHaveURL(/verify-email/);
  42  |   } finally {
  43  |     await request.delete(`${API_URL}/api/test/cleanup-user`, {
  44  |       data: { email },
  45  |     });
  46  |   }
  47  | });
  48  | 
  49  | test('user can login and cleanup test user', async ({ page, request }) => {
  50  |   const email = `e2e-login-${Date.now()}@example.com`;
  51  |   const password = 'TestPassword123!';
  52  | 
  53  |   try {
  54  |     await request.post(`${API_URL}/api/test/seed-user`, {
  55  |       data: {
  56  |         email,
  57  |         password,
  58  |         onboardingCompleted: 0,
  59  |       },
  60  |     });
  61  | 
  62  |     await page.goto('/login');
  63  |     await page.getByTestId('login-email').fill(email);
  64  |     await page.getByTestId('login-password').fill(password);
  65  |     await page.getByTestId('login-submit').click();
  66  | 
  67  |     await expect(page).not.toHaveURL(/login/);
  68  |   } finally {
  69  |     await request.delete(`${API_URL}/api/test/cleanup-user`, {
  70  |       data: { email },
  71  |     });
  72  |   }
  73  | });
  74  | 
  75  | test('full flow: swipe creates shopping list automatically', async ({ page, request }) => {
  76  |   const email = `flow-${Date.now()}@example.com`;
  77  |   const password = 'TestPassword123!';
  78  | 
  79  |   try {
  80  |     await request.post('http://localhost:4000/api/test/seed-user', {
  81  |     data: {
  82  |         email,
  83  |         password,
  84  |         onboardingCompleted: 1,
  85  |     },
  86  |     });
  87  | 
  88  |     await request.post('http://localhost:4000/api/test/seed-meals');
  89  | 
  90  |     await page.goto('/login');
  91  |     await page.getByTestId('login-email').fill(email);
  92  |     await page.getByTestId('login-password').fill(password);
  93  |     await page.getByTestId('login-submit').click();
  94  | 
  95  |     await expect(page).not.toHaveURL(/login/);
  96  | 
  97  |     await page.goto('/');
  98  |     await page.waitForLoadState('networkidle');
  99  | 
  100 |     const likeButton = page.getByTestId('swipe-like');
  101 | 
> 102 |     await expect(likeButton).toBeVisible({ timeout: 10000 });
      |                              ^ Error: expect(locator).toBeVisible() failed
  103 | 
  104 |     for (let i = 0; i < 7; i++) {
  105 |       await expect(likeButton).toBeVisible({ timeout: 10000 });
  106 |       await likeButton.click();
  107 |       await page.waitForTimeout(500);
  108 |     }
  109 | 
  110 |     await page.waitForTimeout(2000);
  111 | 
  112 |     await page.goto('/shopping');
  113 |     await page.waitForLoadState('networkidle');
  114 | 
  115 |     await expect(page.getByTestId('shopping-item').first()).toBeVisible({
  116 |       timeout: 10000,
  117 |     });
  118 |   } finally {
  119 |     await request.delete(`${API_URL}/api/test/cleanup-user`, {
  120 |       data: { email },
  121 |     });
  122 |   }
  123 | });
```