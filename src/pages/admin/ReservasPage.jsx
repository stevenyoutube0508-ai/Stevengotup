import { SecReservas } from "../../features/admin/reservations/SecReservas";
import { useAdminStore } from "../../stores/useAdminStore";

export default function ReservasPage() {
  const reservations    = useAdminStore(s => s.reservations);
  const addReservation  = useAdminStore(s => s.addReservation);
  const moveReservation = useAdminStore(s => s.moveReservation);
  const cancelReservation = useAdminStore(s => s.cancelReservation);
  const showToast       = useAdminStore(s => s.showToast);

  return (
    <SecReservas
      reservations={reservations}
      onAdd={addReservation}
      onMove={moveReservation}
      onCancel={cancelReservation}
      showToast={showToast}
    />
  );
}
