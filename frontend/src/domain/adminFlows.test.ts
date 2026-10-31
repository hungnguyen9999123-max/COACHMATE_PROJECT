import { describe, expect, it } from 'vitest';
import { createSeedState } from '../data/seed';
import { updateAssumptionStatusByAdmin, updateBusinessSettingsByAdmin } from './adminFlows';

describe('Admin configuration flows', () => {
  it('updates business settings and assumptions', () => {
    const state = createSeedState();
    const updatedSettings = updateBusinessSettingsByAdmin(state, {
      commissionPercent: 15,
      paymentFeePercent: 3,
      coachProMonthlyPrice: 150000,
    });

    expect(updatedSettings.settings.commissionPercent).toBe(15);

    const updatedAssumption = updateAssumptionStatusByAdmin(
      updatedSettings,
      'HLV chấp nhận mức hoa hồng',
      'Đã xác nhận',
    );

    expect(updatedAssumption.assumptionStatuses['HLV chấp nhận mức hoa hồng']).toBe('Đã xác nhận');
  });

 });
