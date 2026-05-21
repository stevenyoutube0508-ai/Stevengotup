import { CEODash } from "../../features/ceo/CEODash";
import { useCEOStore } from "../../stores/useCEOStore";

export default function DashPage() {
  const restaurants   = useCEOStore(s => s.restaurants);
  const tickets       = useCEOStore(s => s.tickets);
  const ceoStats      = useCEOStore(s => s.ceoStats);
  return <CEODash restaurants={restaurants} tickets={tickets} ceoStats={ceoStats} />;
}
