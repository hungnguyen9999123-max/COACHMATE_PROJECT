import type { DemoState, Tournament, TournamentRegistration } from './types';

export interface TournamentEconomics {
  registrationCount: number;
  revenue: number;
  paymentFee: number;
  refereeCost: number;
  fixedCost: number;
  totalCost: number;
  estimatedProfit: number;
  breakEvenRegistrations: number;
  contributionPerRegistration: number;
}

export function calculateTournamentEconomics(
  tournament: Tournament,
  registrations: TournamentRegistration[],
  paymentFeePercent: number,
): TournamentEconomics {
  const registrationCount = registrations.filter(
    (registration) => registration.tournamentId === tournament.id,
  ).length;
  const revenue = registrationCount * tournament.fee;
  const paymentFee = (revenue * paymentFeePercent) / 100;
  const refereeCost =
    Math.max(0, registrationCount - 1) * tournament.costPlan.refereePerMatch;
  const fixedCost =
    tournament.costPlan.court +
    tournament.costPlan.staff +
    tournament.costPlan.prize +
    tournament.costPlan.miscellaneous;
  const contributionPerRegistration =
    tournament.fee * (1 - paymentFeePercent / 100) - tournament.costPlan.refereePerMatch;
  const breakEvenRegistrations =
    contributionPerRegistration > 0
      ? Math.ceil(fixedCost / contributionPerRegistration)
      : Number.POSITIVE_INFINITY;
  const totalCost = paymentFee + refereeCost + fixedCost;

  return {
    registrationCount,
    revenue,
    paymentFee,
    refereeCost,
    fixedCost,
    totalCost,
    estimatedProfit: revenue - totalCost,
    breakEvenRegistrations,
    contributionPerRegistration,
  };
}

export function calculatePlatformTotals(state: DemoState) {
  const courseGmv = state.enrollments.reduce((sum, enrollment) => sum + enrollment.price, 0);
  const courseCommission = state.enrollments.reduce(
    (sum, enrollment) => sum + enrollment.commission,
    0,
  );
  const coursePaymentFees = state.enrollments.reduce(
    (sum, enrollment) => sum + enrollment.paymentFee,
    0,
  );
  const subscriptionRevenue = state.subscriptions.reduce(
    (sum, subscription) => sum + subscription.amount,
    0,
  );

  let tournamentRevenue = 0;
  let heldTournamentFees = 0;
  let tournamentPaymentFees = 0;
  let tournamentOperatingCosts = 0;

  state.tournaments.forEach((tournament) => {
    const economics = calculateTournamentEconomics(
      tournament,
      state.tournamentRegistrations,
      state.settings.paymentFeePercent,
    );

    if (tournament.status === 'open') {
      heldTournamentFees += economics.revenue;
      return;
    }

    tournamentRevenue += economics.revenue;
    tournamentPaymentFees += economics.paymentFee;
    tournamentOperatingCosts += economics.refereeCost + economics.fixedCost;
  });

  const platformRevenue = courseCommission + subscriptionRevenue + tournamentRevenue;
  const totalCosts =
    coursePaymentFees + tournamentPaymentFees + tournamentOperatingCosts;

  return {
    courseGmv,
    courseCommission,
    coursePaymentFees,
    subscriptionRevenue,
    tournamentRevenue,
    heldTournamentFees,
    tournamentPaymentFees,
    tournamentOperatingCosts,
    platformRevenue,
    totalCosts,
    estimatedProfit: platformRevenue - totalCosts,
  };
}
