import './ActionCard.css';

const ActionCard = ({ title, subtitle, color, icon, onClick }) => {
  return (
    <div className="action-card" onClick={onClick}>
      <div className="action-card-bg" />
      <div className="action-card-blob" style={{ backgroundColor: color }} />
      <div className="action-card-content">
        <div className="action-card-icon" style={{ borderColor: color }}>
          {icon}
        </div>
        <h3 className="action-card-title">{title}</h3>
        <p className="action-card-subtitle">{subtitle}</p>
      </div>
    </div>
  );
};

export default ActionCard;
