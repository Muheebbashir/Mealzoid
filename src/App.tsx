import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/protectedRoute";
import PublicRoute from "./components/publicRoute";
import SelectRole from "./pages/SelectRole";
import Navbar from "./components/Navbar";
import Account from "./pages/Account";
import Restaurant from "./pages/Restaurant";
import RestaurantDetails from "./pages/RestaurantDetails";
import Cart from "./pages/Cart";
import Address from "./pages/Address";
import Checkout from "./pages/Checkout";

import { useAuthUser } from "./hooks/useProfile";
import { useRealtime } from "./hooks/useRealTime";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import RiderDashboard from "./pages/RiderDashboard";
import Admin from "./pages/Admin";

const App = () => {
  const { user, isLoading } = useAuthUser();

  // Global realtime listeners — also manages socket connect/disconnect
  useRealtime();

  /* ============================= */
  /*     WAIT FOR AUTH TO RESOLVE  */
  /* ============================= */
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E23744] border-t-transparent" />
      </div>
    );
  }

  /* ============================= */
  /*        SELLER VIEW ONLY      */
  /* ============================= */
  if (user && user.role === "seller") {
    return (
      <>
        <Toaster position="top-right" />
        <Restaurant />
      </>
    );
  }

  if(user && user.role === "rider"){
    return (
      <>
        <Toaster position="top-right" />
        <RiderDashboard />
      </>
    )
  }

  if(user && user.role === "admin"){
    return (
      <>
      <Toaster position="top-right" />
      <Admin/>
      </>
    )
  }

  /* ============================= */
  /*         NORMAL USER          */
  /* ============================= */
  return (
    <>
      <Toaster position="top-right" />
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/address" element={<Address />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} /> 
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
        
    </>
  );
};

export default App;