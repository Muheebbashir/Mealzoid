import { useVerifyRider } from "../hooks/useAdmin";
import type { Rider } from "../types/rider.types";

interface Props {
  rider: Rider;
}

const PendingRiderCard = ({ rider }: Props) => {
  const { verifyRider, isPending } = useVerifyRider();

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-4">
        <img
          src={rider.picture}
          alt="Rider"
          className="h-16 w-16 rounded-full object-cover border-2 border-[#E23744]"
        />
        <div>
          <span className="inline-block rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-white">
            Pending
          </span>
          <p className="mt-1 text-sm text-gray-500">{rider.phoneNumber}</p>
        </div>
      </div>
      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Aadhaar</span>
          <span>{rider.addharNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">License</span>
          <span>{rider.drivingLicenseNumber}</span>
        </div>
      </div>
      <button
        onClick={() => verifyRider(rider._id)}
        disabled={isPending}
        className="w-full rounded-lg bg-[#E23744] py-2 text-sm font-semibold text-white hover:bg-[#c4303c] disabled:opacity-50 transition"
      >
        {isPending ? "Verifying..." : "Verify Rider"}
      </button>
    </div>
  );
};

export default PendingRiderCard;