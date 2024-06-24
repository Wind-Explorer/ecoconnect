export function getTimeOfDay(): number {
  const currentHour = new Date().getHours();

  if (currentHour >= 6 && currentHour < 12) {
    return 0; // Morning
  } else if (currentHour >= 12 && currentHour < 18) {
    return 1; // Afternoon
  } else {
    return 2; // Evening
  }
}
