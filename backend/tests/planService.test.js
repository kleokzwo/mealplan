import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/config/db.js', () => {
  const mockPool = {
    query: vi.fn(),
  };

  return {
    pool: mockPool,
    default: mockPool,
  };
});

import { pool } from '../src/config/db.js';
import { createActiveWeek } from '../src/services/planService.js';

describe('planService createActiveWeek', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

    it('throws error when fewer than 7 meals are selected', async () => {
    pool.query
        .mockResolvedValueOnce([[{ plan_type: 'free', subscription_status: null }]])
        .mockResolvedValueOnce([[{ count: 0 }]]);

    await expect(
        createActiveWeek({
        mealIds: [1, 2, 3, 4, 5, 6],
        userId: 1,
        })
    ).rejects.toMatchObject({
        statusCode: 400,
    });
    });

  it('blocks free users after 10 weekly plans', async () => {
    pool.query
      .mockResolvedValueOnce([[{ plan_type: 'free', subscription_status: null }]])
      .mockResolvedValueOnce([[{ count: 10 }]]);

    await expect(
      createActiveWeek({
        mealIds: [1, 2, 3, 4, 5, 6, 7],
        userId: 1,
      })
    ).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});