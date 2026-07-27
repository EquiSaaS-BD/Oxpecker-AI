export function BookingModal({ doctorId, isOpen, onClose }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Book Appointment</h2>
        <p className="text-slate-500 mb-6">Booking feature coming soon!</p>
        <button onClick={onClose} className="px-4 py-2 bg-primary text-white rounded-lg w-full">
          Close
        </button>
      </div>
    </div>
  );
}
