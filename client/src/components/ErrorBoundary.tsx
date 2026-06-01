import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props  { children: ReactNode }
interface State  { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center py-24 gap-4 text-center"
      >
        <span className="text-5xl" aria-hidden="true">⚠️</span>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground text-sm max-w-sm">{this.state.message || 'An unexpected error occurred.'}</p>
        <Button onClick={() => this.setState({ hasError: false, message: '' })}>
          Try again
        </Button>
      </div>
    );
  }
}
