export const RESPONSE_TYPES = {
    YES: 'YES',
    NO: 'NO',
    NA: 'NA',
    OTHER: 'OTHER',
    UNANSWERED: 'UNANSWERED',
} as const;

export const AI_OPINIONS = {
    PASS: 'PASS',
    FAIL: 'FAIL',
    INFO: 'INFO',
} as const;

export const FILTER_TYPES = {
    ALL: 'ALL',
    NEEDS_ATTENTION: 'NEEDS_ATTENTION',
    HIGH_RISK: 'HIGH_RISK',
    ACTION_REQUIRED: 'ACTION_REQUIRED',
    YES: 'YES',
    NO: 'NO',
    NA: 'NA',
    OTHER: 'OTHER',
} as const;

export type FilterType = keyof typeof FILTER_TYPES;
