import { describe, expect, it } from 'vitest';
import { createSeedState } from '../data/seed';
import { calculatePlatformTotals, calculateTournamentEconomics } from './finance';

describe('financial preservation rules', () => {
  it('reproduces the complete seeded platform baseline', () => {
    const state = createSeedState();

    expect(calculatePlatformTotals(state)).toEqual({
      courseGmv: 21_000_000,
      courseCommission: 2_100_000,
      coursePaymentFees: 420_000,
      subscriptionRevenue: 99_000,
      tournamentRevenue: 0,
      heldTournamentFees: 3_450_000,
      tournamentPaymentFees: 0,
      tournamentOperatingCosts: 0,
      platformRevenue: 2_199_000,
      totalCosts: 420_000,
      estimatedProfit: 1_779_000,
    });
  });

  it('reproduces tournament break-even and projected profit', () => {
    const state = createSeedState();
    const first = calculateTournamentEconomics(
      state.tournaments[0],
      state.tournamentRegistrations,
      state.settings.paymentFeePercent,
    );
    const second = calculateTournamentEconomics(
      state.tournaments[1],
      state.tournamentRegistrations,
      state.settings.paymentFeePercent,
    );

    expect(first).toMatchObject({
      registrationCount: 9,
      revenue: 2_250_000,
      paymentFee: 45_000,
      refereeCost: 480_000,
      fixedCost: 4_400_000,
      estimatedProfit: -2_675_000,
      breakEvenRegistrations: 24,
      contributionPerRegistration: 185_000,
    });
    expect(second).toMatchObject({
      registrationCount: 3,
      revenue: 1_200_000,
      paymentFee: 24_000,
      refereeCost: 120_000,
      fixedCost: 4_600_000,
      estimatedProfit: -3_544_000,
      breakEvenRegistrations: 14,
      contributionPerRegistration: 332_000,
    });
  });

  it('returns infinite break-even when each registration cannot cover referee cost', () => {
    const state = createSeedState();
    const tournament = {
      ...state.tournaments[0],
      fee: 50_000,
      costPlan: { ...state.tournaments[0].costPlan, refereePerMatch: 60_000 },
    };

    expect(
      calculateTournamentEconomics(tournament, [], 2).breakEvenRegistrations,
    ).toBe(Number.POSITIVE_INFINITY);
  });
});
