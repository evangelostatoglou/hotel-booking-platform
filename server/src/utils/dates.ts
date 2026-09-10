



export function calculateNights(checkIn: string, checkOut: string): number {

  const start = Date.parse(
    `${checkIn}T00:00:00Z`
  );

  const end = Date.parse(
    `${checkOut}T00:00:00Z`
  );

  return Math.round(
    (end - start) / (1000 * 60 * 60 * 24)
  );
}