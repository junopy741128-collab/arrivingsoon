import React, { Component, ErrorInfo, ReactNode } from 'react';


interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        // Sentry removed
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', backgroundColor: '#3d1a1a', color: 'white', height: '100vh', overflow: 'auto' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>오류가 발생했습니다</h1>
                    <p style={{ marginBottom: '1rem' }}>아래 내용을 캡쳐해서 개발자에게 보내주세요.</p>

                    <div style={{ backgroundColor: 'black', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                        <strong>Error:</strong><br />
                        {this.state.error?.toString()}
                    </div>

                    <div style={{ backgroundColor: 'black', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.7rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                        <strong>Stack:</strong><br />
                        {this.state.errorInfo?.componentStack}
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        style={{ backgroundColor: '#ff6b6b', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 'bold', width: '100%' }}
                    >
                        앱 재시작
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
