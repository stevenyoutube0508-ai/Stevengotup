import { CEORestaurantes } from "../../features/ceo/CEORestaurantes";
import { useCEOStore } from "../../stores/useCEOStore";

export default function RestaurantesPage(){
  const restaurants = useCEOStore(s => s.restaurants);
  const updateRestaurant = useCEOStore(s => s.updateRestaurant);
  return <CEORestaurantes restaurants={restaurants} onUpdate={updateRestaurant}/>;
}
