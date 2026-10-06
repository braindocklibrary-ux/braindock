// Dedicated 102-Seat Matrix Configuration for Brain Dock Library
// Pure Clean State: All 102 seats initialized as Available ready for real student admissions & TimeWatch punches.

export function generateInitial102SeatsAndAdmissions() {
  const seats = [];

  for (let i = 1; i <= 102; i++) {
    let zone = 'Zone A (Ground Floor - Silent Hall)';
    let floor = 'Ground Floor';
    if (i > 26 && i <= 52) {
      zone = 'Zone B (Ground Floor - Regular Reading)';
      floor = 'Ground Floor';
    } else if (i > 52 && i <= 78) {
      zone = 'Zone C (1st Floor - Silent Acoustic Pods)';
      floor = '1st Floor';
    } else if (i > 78) {
      zone = 'Zone D (1st Floor - Digital Research Bay)';
      floor = '1st Floor';
    }

    seats.push({
      seatNumber: i,
      seatLabel: `Seat ${String(i).padStart(2, '0')}`,
      zone,
      floor,
      hasSocket: true,
      hasLamp: true,
      hasErgonomicChair: true,
      status: 'Available',
      occupant: null
    });
  }

  // Pure Live Mode: Zero dummy records
  const admissions = [];
  const receipts = [];
  const initialBiometricLogs = [];

  return { seats, admissions, receipts, initialBiometricLogs };
}
