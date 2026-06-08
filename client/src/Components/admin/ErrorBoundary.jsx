/**
 * AdminErrorBoundary — Catches React render errors in admin pages
 * Wrap individual admin pages or the entire admin layout
 */
import { Component } from "react";
import { FaTriangleExclamation, FaArrowRotateRight } from "react-icons/fa6";

export default class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[AdminErrorBoundary]", error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex items-center justify-center h-full min-h-[400px] p-8" dir="rtl">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <FaTriangleExclamation className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            حدث خطأ غير متوقع
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            واجه هذا القسم خطأ في العرض. يمكنك إعادة المحاولة أو العودة للوحة التحكم.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-xs text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl text-left mb-5 overflow-auto max-h-32 border border-red-100 dark:border-red-800">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={this.reset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "var(--primary)" }}
            >
              <FaArrowRotateRight className="w-3.5 h-3.5" />
              إعادة المحاولة
            </button>
            <a
              href="/admin"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              لوحة التحكم
            </a>
          </div>
        </div>
      </div>
    );
  }
}
