export default function CancelPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-center p-6">
      <h1 className="text-3xl font-bold text-red-700 mb-4">भुगतान रद्द ❌</h1>
      <p className="text-gray-700 mb-6">आपका भुगतान रद्द कर दिया गया है।</p>
      <a
        href="/consultation"
        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
      >
        पुनः प्रयास करें
      </a>
    </div>
  );
}
