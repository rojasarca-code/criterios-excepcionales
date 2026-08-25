export function chipClass(res) {
  if (/^(CUMPLE|FAVORABLE)/.test(res)) return 'chip chip-ok';
  if (/^(NO CUMPLE|DESFAVORABLE|NO CORRESPONDE)/.test(res)) return 'chip chip-bad';
  return 'chip';
}

export function bannerClass(final) {
  if (/^FAVORABLE/.test(final)) return 'banner-final ok';
  if (/^(DESFAVORABLE|NO CORRESPONDE)/.test(final)) return 'banner-final bad';
  return 'banner-final';
}
