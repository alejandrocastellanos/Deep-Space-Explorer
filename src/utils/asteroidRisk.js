export function riskBorderColor(isHazardous) {
  return isHazardous ? 'border-l-red-600' : 'border-l-transparent'
}

export function riskBadgeClass(isHazardous) {
  return isHazardous
    ? 'bg-tertiary-container/20 border border-tertiary-container text-tertiary-container animate-pulse'
    : 'bg-green-900/20 border border-green-500/50 text-green-500'
}

export function riskLabel(isHazardous) {
  return isHazardous ? 'HAZARDOUS' : 'SAFE'
}

export function riskIcon(isHazardous) {
  return isHazardous ? 'warning' : 'brightness_empty'
}

export function riskIconClass(isHazardous) {
  return isHazardous ? 'text-tertiary-container animate-pulse' : 'text-secondary-container'
}
