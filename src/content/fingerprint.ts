//! Detects GitHub variant (React vs Rails/Turbo, A/B tests, Primer version)
export function detectVariant(): string {
  if (document.querySelector('#__next') || document.querySelector('[data-reactroot]')) {
    return 'react-app';
  }

  return 'default';
}
