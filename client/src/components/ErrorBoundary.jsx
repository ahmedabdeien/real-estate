import React from 'react';
import { FaBug, FaRotateRight } from 'react-icons/fa6';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, info } = this.state;

    return (
      <div style={{ padding: 32, fontFamily: 'Cairo, Arial, sans-serif', direction: 'rtl', minHeight: '100vh', background: '#fff8f8', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80 }}>
        <div style={{ maxWidth: 700, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaBug style={{ color: '#dc2626', fontSize: 22 }} />
            </div>
            <div>
              <h2 style={{ margin: 0, color: '#111', fontSize: 18, fontWeight: 800 }}>حدث خطأ في هذه الصفحة</h2>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>الرسالة الكاملة للخطأ:</p>
            </div>
          </div>

          <div style={{ background: '#1f2937', color: '#f9fafb', borderRadius: 10, padding: '16px 20px', marginBottom: 16, fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.6, direction: 'ltr', textAlign: 'left' }}>
            {error?.message || String(error)}
          </div>

          {info?.componentStack && (
            <details style={{ marginBottom: 16 }}>
              <summary style={{ cursor: 'pointer', color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Component Stack</summary>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px', fontFamily: 'monospace', fontSize: 11, whiteSpace: 'pre', overflowX: 'auto', direction: 'ltr', textAlign: 'left' }}>
                {info.componentStack}
              </div>
            </details>
          )}

          <button
            onClick={() => this.setState({ hasError: false, error: null, info: null })}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#da1f27', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'Cairo, Arial, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            <FaRotateRight />
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }
}
