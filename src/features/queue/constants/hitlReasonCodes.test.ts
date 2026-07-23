import { describe, it, expect } from 'vitest';
import {
  HITL_REASON_CODES_BY_ACTION,
  DOWNGRADE_GRADE_OPTIONS,
  APPROVE_NORMAL_GRADE,
} from './hitlReasonCodes';

describe('hitlReasonCodes', () => {
  it('maps APPROVE_NORMAL to false-positive (FP_*) reason codes only', () => {
    const codes = HITL_REASON_CODES_BY_ACTION.APPROVE_NORMAL.map((r) => r.code);
    expect(codes.every((code) => code.startsWith('FP_'))).toBe(true);
    expect(codes.length).toBeGreaterThan(0);
  });

  it('maps APPROVE_DOWNGRADE / REJECT_RETURN / REJECT_DISCARD to damage (DMG_*) reason codes only', () => {
    for (const action of ['APPROVE_DOWNGRADE', 'REJECT_RETURN', 'REJECT_DISCARD'] as const) {
      const codes = HITL_REASON_CODES_BY_ACTION[action].map((r) => r.code);
      expect(codes.every((code) => code.startsWith('DMG_'))).toBe(true);
      expect(codes).toContain('DMG_EXT_CRUSH');
      expect(codes).toContain('DMG_INT_BARCODE');
      expect(codes).toContain('DMG_EXT_OTHER');
      expect(codes).toContain('DMG_INT_OTHER');
    }
  });

  it('maps RE_CHECK to system/exception (SYS_*) reason codes only', () => {
    const codes = HITL_REASON_CODES_BY_ACTION.RE_CHECK.map((r) => r.code);
    expect(codes.every((code) => code.startsWith('SYS_'))).toBe(true);
    expect(codes.length).toBeGreaterThan(0);
  });

  it('exposes only EXCELLENT/NORMAL as downgrade grade options (never MINT or REJECT)', () => {
    expect(DOWNGRADE_GRADE_OPTIONS).toEqual(['EXCELLENT', 'NORMAL']);
  });

  it('keeps APPROVE_NORMAL grade as MINT for display purposes', () => {
    expect(APPROVE_NORMAL_GRADE).toBe('MINT');
  });
});
