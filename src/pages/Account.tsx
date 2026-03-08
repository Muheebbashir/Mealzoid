import toast from "react-hot-toast";
import { useAuthUser } from "../hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { BiLogOut, BiMapPin, BiPackage, BiChevronRight } from "react-icons/bi";
import { useQueryClient } from "@tanstack/react-query";
const Account = () => {
    const {user} = useAuthUser();
    const queryClient=useQueryClient();
    const firstLetter= user?.name ? user.name.charAt(0).toUpperCase() : "?";
    const navigate=useNavigate();
    const logoutHandler=()=>{
        localStorage.removeItem("token");
        queryClient.removeQueries({queryKey:["authUser"]});
        toast.success("Logged out successfully");
        navigate("/login");
    }
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-md">
            {/* Profile card */}
            <div className="mb-4 rounded-2xl bg-white shadow-sm overflow-hidden">
                <div className="h-20 bg-linear-to-r from-[#E23744] to-[#ff6b6b]" />
                <div className="px-5 pb-5">
                    <div className="-mt-8 mb-3 flex items-end gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E23744] text-2xl font-bold text-white shadow-md ring-4 ring-white">
                            {firstLetter}
                        </div>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
            </div>

            {/* Menu items */}
            <div className="rounded-2xl bg-white shadow-sm divide-y overflow-hidden">
                <div className="flex cursor-pointer items-center gap-4 px-5 py-4 hover:bg-gray-50 transition" onClick={()=>navigate("/orders")}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
                        <BiPackage className="h-5 w-5 text-[#E23744]"/>
                    </div>
                    <span className="flex-1 font-medium text-gray-800">Your Orders</span>
                    <BiChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex cursor-pointer items-center gap-4 px-5 py-4 hover:bg-gray-50 transition" onClick={()=>navigate("/address")}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
                        <BiMapPin className="h-5 w-5 text-[#E23744]"/>
                    </div>
                    <span className="flex-1 font-medium text-gray-800">Your Addresses</span>
                    <BiChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex cursor-pointer items-center gap-4 px-5 py-4 hover:bg-red-50 transition" onClick={logoutHandler}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
                        <BiLogOut className="h-5 w-5 text-red-500"/>
                    </div>
                    <span className="flex-1 font-medium text-red-600">Logout</span>
                    <BiChevronRight className="h-5 w-5 text-red-300" />
                </div>
            </div>
        </div>
    </div>
  )
}

export default Account