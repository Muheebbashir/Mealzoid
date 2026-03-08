import { useLocation as useRouterLocation, useSearchParams, Link } from "react-router-dom";
import { useAuthUser } from "../hooks/useProfile";
import { useUserLocation } from "../hooks/useLocation";
import { useEffect, useState } from "react";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch } from "react-icons/bi";
import { useMyCart } from "../hooks/useCart";

const Navbar = () => {
  const { isAuthenticated } = useAuthUser();
  const currLocation = useRouterLocation();
  const { location, isLoading, geoError } = useUserLocation();
  const isHomePage = currLocation.pathname === "/";
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const { cartLength } = useMyCart();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        setSearchParams({ search });
      } else {
        setSearchParams({});
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, setSearchParams]);

  return (
    <div className="w-full bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to={"/"} className="text-xl font-bold text-[#E23744] cursor-pointer sm:text-2xl">
          Mealzoid
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to={"/cart"} className="relative">
            <CgShoppingCart className="h-6 w-6 text-[#E23744]" />
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#E23744] text-xs font-semibold text-white">
              {cartLength}
            </span>
          </Link>
          {isAuthenticated ? (
            <Link to={"/account"} className="font-medium text-[#E23744] text-sm sm:text-base">Account</Link>
          ) : (
            <Link to={"/login"} className="font-medium text-[#E23744] text-sm sm:text-base">Login</Link>
          )}
        </div>
      </div>

      {isHomePage && (
        <div className="border-t px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center rounded-lg border shadow-sm">
            <div className="flex items-center gap-2 px-3 border-r text-gray-700 shrink-0">
              <BiMapPin className="h-4 w-4 shrink-0 text-[#E23744]" />
              <span className="text-sm truncate max-w-25 sm:max-w-40">
                {geoError
                  ? "Off"
                  : isLoading
                  ? "..."
                  : location?.display ?? "City"}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
              <BiSearch className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                type="text"
                value={search}
                placeholder="Search restaurants"
                onChange={e => setSearch(e.target.value)}
                className="w-full py-2 text-sm outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;