export function ReliabilityCoreFallback() {
  return (
    <div className="reliability-fallback" aria-hidden>
      <div className="reliability-fallback-ring reliability-fallback-ring-one" />
      <div className="reliability-fallback-ring reliability-fallback-ring-two" />
      <div className="reliability-fallback-core" />
      <span className="reliability-fallback-node reliability-fallback-node-ai">AI</span>
      <span className="reliability-fallback-node reliability-fallback-node-cloud">CLOUD</span>
      <span className="reliability-fallback-node reliability-fallback-node-test">TEST</span>
      <span className="reliability-fallback-node reliability-fallback-node-ship">SHIP</span>
    </div>
  );
}
