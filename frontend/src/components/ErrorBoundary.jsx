import { Component } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("Cloud AI Chatbot crashed:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-bg-deep px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-state-error/10">
            <AlertOctagon size={26} className="text-state-error" />
          </div>
          <h1 className="font-display text-xl font-semibold text-white">Something went wrong</h1>
          <p className="max-w-sm text-sm text-gray-400">
            An unexpected error occurred while rendering Cloud AI Chatbot. Try reloading the page.
          </p>
          <button onClick={this.handleReset} className="btn-primary text-sm">
            <RotateCcw size={14} /> Reload app
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
