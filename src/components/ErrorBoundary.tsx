import { Component, type ErrorInfo, type ReactNode } from 'react';
import { listRecoveryCheckpoints } from '../services/goldMaster';
import { persistCareer } from '../domain/career';

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Vale recovery boundary', error, info.componentStack);
  }

  restore = () => {
    const checkpoint = listRecoveryCheckpoints()[0];
    if (!checkpoint) return;
    persistCareer(checkpoint.career);
    location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    const hasCheckpoint = listRecoveryCheckpoints().length > 0;
    return (
      <main className="fatal-recovery">
        <div>
          <span>RECUPERAÇÃO VALE</span>
          <h1>O jogo encontrou um erro, mas seu progresso está protegido.</h1>
          <p>{this.state.error.message}</p>
          <button onClick={() => location.reload()}>Recarregar jogo</button>
          {hasCheckpoint && <button onClick={this.restore}>Restaurar último checkpoint</button>}
        </div>
      </main>
    );
  }
}
