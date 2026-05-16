import { CEOPagos } from "../../features/ceo/CEOPagos";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAdminStore } from "../../stores/useAdminStore";
import { useCEOStore } from "../../stores/useCEOStore";

export default function PagosPage(){
  const user = useAuthStore(s => s.user);
  const showToast = useAdminStore(s => s.showToast);
  const restaurants = useCEOStore(s => s.restaurants);
  const paymentRequests = useCEOStore(s => s.paymentRequests);
  const approvePaymentBase = useCEOStore(s => s.approvePayment);
  const rejectPaymentBase = useCEOStore(s => s.rejectPayment);
  const payReqLoading = useCEOStore(s => s.payReqLoading);
  const approvePayment = req => approvePaymentBase(req, user?.name || "CEO", showToast);
  const rejectPayment = (req, note) => rejectPaymentBase(req, note, user?.name || "CEO", showToast);
  return <CEOPagos restaurants={restaurants} paymentRequests={paymentRequests} onApprove={approvePayment} onReject={rejectPayment} loading={payReqLoading}/>;
}
