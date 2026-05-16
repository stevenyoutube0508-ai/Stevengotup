import { CEOSoporte } from "../../features/ceo/CEOSoporte";
import { useCEOStore } from "../../stores/useCEOStore";

export default function SoportePage(){
  const tickets = useCEOStore(s => s.tickets);
  const updateTicket = useCEOStore(s => s.updateTicket);
  return <CEOSoporte tickets={tickets} onUpdateTicket={updateTicket}/>;
}
