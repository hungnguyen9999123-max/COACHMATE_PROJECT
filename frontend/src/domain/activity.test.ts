import { describe, expect, it } from 'vitest';
import { prependActivity } from './activity';

describe('activity log', () => {
  it('prepends new activity and caps the log at 80 entries', () => {
    const existing = Array.from({ length: 80 }, (_, index) => ({
      id: `old-${index}`,
      occurredAt: '2026-10-01T00:00:00+07:00',
      actorName: 'Demo',
      action: `Action ${index}`,
    }));
    const next = prependActivity(existing, {
      id: 'new',
      occurredAt: '2026-10-30T12:00:00+07:00',
      actorName: 'CoachMate',
      action: 'New action',
    });

    expect(next).toHaveLength(80);
    expect(next[0].id).toBe('new');
    expect(next.at(-1)?.id).toBe('old-78');
  });
});
