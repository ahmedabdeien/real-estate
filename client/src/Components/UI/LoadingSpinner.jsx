export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizes = { sm: "w-5 h-5 border-2", md: "w-8 h-8 border-2", lg: "w-12 h-12 border-4" };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} border-gray-200 dark:border-gray-700 border-t-[#2d5d89] rounded-full animate-spin`} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 border-4 border-gray-100 dark:border-gray-800 border-t-[#2d5d89] rounded-full animate-spin" />
        <span className="text-[#2d5d89] font-bold text-sm tracking-wider">الصرح للعقارات</span>
      </div>
    </div>
  );
}
