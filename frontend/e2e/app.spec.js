import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:4000';

test('redirects logged-out user to login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/login/);
});

test('login page renders', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByTestId('login-email')).toBeVisible();
  await expect(page.getByTestId('login-password')).toBeVisible();
  await expect(page.getByTestId('login-submit')).toBeVisible();
});

test('register page renders', async ({ page }) => {
  await page.goto('/register');

  await expect(page.getByTestId('register-email')).toBeVisible();
  await expect(page.getByTestId('register-password')).toBeVisible();
  await expect(page.getByTestId('register-submit')).toBeVisible();
});

test('user is redirected to verify email after register', async ({ page, request }) => {
  const email = `verify-${Date.now()}@example.com`;

  try {
    await page.goto('/register');

    const nameInput = page.getByTestId('register-name');
    if (await nameInput.count()) {
      await nameInput.fill('Test User');
    }

    await page.getByTestId('register-email').fill(email);
    await page.getByTestId('register-password').fill('TestPassword123!');
    await page.getByTestId('register-submit').click();

    await expect(page).toHaveURL(/verify-email/);
  } finally {
    await request.delete(`${API_URL}/api/test/cleanup-user`, {
      data: { email },
    });
  }
});

test('user can login and cleanup test user', async ({ page, request }) => {
  const email = `e2e-login-${Date.now()}@example.com`;
  const password = 'TestPassword123!';

  try {
    await request.post(`${API_URL}/api/test/seed-user`, {
      data: {
        email,
        password,
        onboardingCompleted: 0,
      },
    });

    await page.goto('/login');
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(password);
    await page.getByTestId('login-submit').click();

    await expect(page).not.toHaveURL(/login/);
  } finally {
    await request.delete(`${API_URL}/api/test/cleanup-user`, {
      data: { email },
    });
  }
});

test('full flow: swipe creates shopping list automatically', async ({ page, request }) => {
  const email = `flow-${Date.now()}@example.com`;
  const password = 'TestPassword123!';

  try {
    await request.post('http://localhost:4000/api/test/seed-user', {
    data: {
        email,
        password,
        onboardingCompleted: 1,
    },
    });

    await request.post('http://localhost:4000/api/test/seed-meals');

    await page.goto('/login');
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(password);
    await page.getByTestId('login-submit').click();

    await expect(page).not.toHaveURL(/login/);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const likeButton = page.getByTestId('swipe-like');

    await expect(likeButton).toBeVisible({ timeout: 10000 });

    for (let i = 0; i < 7; i++) {
      await expect(likeButton).toBeVisible({ timeout: 10000 });
      await likeButton.click();
      await page.waitForTimeout(500);
    }

    await page.waitForTimeout(2000);

    await page.goto('/shopping');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('shopping-item').first()).toBeVisible({
      timeout: 10000,
    });
  } finally {
    await request.delete(`${API_URL}/api/test/cleanup-user`, {
      data: { email },
    });
  }
});