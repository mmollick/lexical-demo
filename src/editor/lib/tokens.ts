/**
 * Merge-tag definitions.
 *
 * In a real app these resolve against database entities. The editor only ever
 * needs the label/name pair plus a test value, so this keeps that shape and
 * drops the data layer.
 */

export interface TokenConfig {
  /** The label for the token, displayed in the editor UI */
  label: string;
  /** The actual token that will be inserted into the document */
  name: string;
  /** The value to use when previewing */
  testValue: string;
}

export const TOKEN_REGEX = /{{([\w.:]+)}}/;

/**
 * Sorts TokenConfig objects with localeCompare, grouping custom attributes at
 * the end.
 */
export const sortTokens = (a: TokenConfig, b: TokenConfig): number => {
  if (a.name.startsWith('custom:') === b.name.startsWith('custom:')) {
    return a.label.localeCompare(b.label);
  } else if (a.name.startsWith('custom:')) {
    return 1;
  } else if (b.name.startsWith('custom:')) {
    return -1;
  }
  return 0;
};

/** Sample merge tags for the playground. */
export const sampleTokens: TokenConfig[] = [
  { label: 'First Name', name: 'customer.firstName', testValue: 'Ada' },
  { label: 'Last Name', name: 'customer.lastName', testValue: 'Lovelace' },
  { label: 'Email', name: 'customer.email', testValue: 'ada@example.com' },
  { label: 'Company', name: 'company.name', testValue: 'Analytical Engines' },
  { label: 'Sender Name', name: 'sender.companyName', testValue: 'Acme Inc.' },
  { label: 'Unsubscribe Link', name: 'unsubscribeLink', testValue: '#' },
  { label: 'Custom: Plan', name: 'custom:plan', testValue: 'Enterprise' },
];

export const getTokenConfig = (token: string): TokenConfig | undefined =>
  sampleTokens.find((t) => t.name === token);
