'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ProductErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Product form error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-neutral-50">
          {/* Header */}
          <div className="bg-white border-b border-neutral-200">
            <div className="px-6 py-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/admin/products">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-serif font-semibold">Error Loading Product</h1>
                  <p className="text-neutral-600">
                    There was a problem loading the product form
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="text-center">
                  <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
                  <p className="text-gray-600 mb-6">
                    There was an error loading the product form. This might be due to a network issue or invalid product data.
                  </p>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={() => window.location.reload()}
                      className="w-full"
                    >
                      Reload Page
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                      className="w-full"
                    >
                      Try Again
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full"
                    >
                      <Link href="/admin/products">
                        Go Back to Products
                      </Link>
                    </Button>
                  </div>

                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="mt-6 text-left">
                      <summary className="cursor-pointer text-sm text-gray-500 mb-2">Error Details (Development)</summary>
                      <div className="bg-red-50 border border-red-200 rounded p-4 text-xs">
                        <div className="mb-2">
                          <strong>Error:</strong> {this.state.error.message}
                        </div>
                        {this.state.error.stack && (
                          <div className="mb-2">
                            <strong>Stack trace:</strong>
                            <pre className="mt-1 text-red-600 overflow-auto whitespace-pre-wrap">
                              {this.state.error.stack}
                            </pre>
                          </div>
                        )}
                        {this.state.errorInfo && (
                          <div>
                            <strong>Component stack:</strong>
                            <pre className="mt-1 text-red-600 overflow-auto whitespace-pre-wrap">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
