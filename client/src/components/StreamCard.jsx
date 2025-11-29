import './StreamCard.css';

const StreamCard = ({ stream, color, onClick }) => {
  return (
    <div className="stream-card" onClick={onClick}>
      <div className="stream-card-bg" />
      <div className="stream-card-blob" style={{ backgroundColor: color }} />
      <div className="stream-card-content">
        <h3 className="stream-card-title">{stream}</h3>
        <p className="stream-card-subtitle">View Requests</p>
        <div className="stream-card-arrow" style={{ borderColor: color }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default StreamCard;
