import React, { useState, useMemo } from 'react';
import { formatDateForDisplay, groupDatesByMonth } from '../../utils/calendarUtils';
import { format } from 'date-fns';
import './SelectedDatesSummary.css';

const DateItem = ({ date, onRemove, monthLabel, isLast }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(date);
    }, 200); // Animation duration
  };

  return (
    <div className={`date-item ${isRemoving ? 'removing' : ''}`}>
      <div className="date-content">
        <span className="date-text">
          {formatDateForDisplay(date)}
        </span>
        <button 
          className="remove-btn"
          onClick={handleRemove}
          title="Remove this date"
          aria-label={`Remove ${formatDateForDisplay(date)}`}
        >
          ×
        </button>
      </div>
      {!isLast && <div className="date-separator" />}
    </div>
  );
};

const MonthGroup = ({ monthLabel, dates, onRemoveDate, isExpanded, onToggle }) => {
  return (
    <div className="month-group">
      <div className="month-header" onClick={onToggle}>
        <h4 className="month-title">
          {monthLabel}
          <span className="month-count">({dates.length})</span>
        </h4>
        <button className={`expand-btn ${isExpanded ? 'expanded' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.427 9.573L8 6l3.573 3.573a.5.5 0 0 0 .708-.708L8.354 4.939a.5.5 0 0 0-.708 0L3.72 8.865a.5.5 0 1 0 .708.708z"/>
          </svg>
        </button>
      </div>
      
      {isExpanded && (
        <div className="month-dates">
          {dates.map((date, index) => (
            <DateItem
              key={date.getTime()}
              date={date}
              onRemove={onRemoveDate}
              monthLabel={monthLabel}
              isLast={index === dates.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SelectedDatesSummary = ({ 
  selectedDates = [], 
  onRemoveDate, 
  onClearAll, 
  groupByMonth = true,
  showActions = true,
  maxHeight = '300px'
}) => {
  const [expandedMonths, setExpandedMonths] = useState(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Group dates by month if enabled
  const groupedDates = useMemo(() => {
    if (!groupByMonth || selectedDates.length === 0) {
      return new Map([['all', { label: 'Selected Dates', dates: selectedDates }]]);
    }
    return groupDatesByMonth(selectedDates);
  }, [selectedDates, groupByMonth]);

  // Initialize expanded state for all months
  React.useEffect(() => {
    if (groupByMonth && groupedDates.size <= 2) {
      // Auto-expand if 2 or fewer months
      setExpandedMonths(new Set(groupedDates.keys()));
    } else if (!groupByMonth) {
      // Always expand if not grouping by month
      setExpandedMonths(new Set(['all']));
    }
  }, [groupedDates, groupByMonth]);

  const toggleMonth = (monthKey) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey);
    } else {
      newExpanded.add(monthKey);
    }
    setExpandedMonths(newExpanded);
  };

  const handleClearAll = () => {
    if (showClearConfirm) {
      onClearAll();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  const handleRemoveDate = (dateToRemove) => {
    onRemoveDate(dateToRemove);
  };

  if (selectedDates.length === 0) {
    return (
      <div className="selected-dates-summary empty">
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <p className="empty-message">No dates selected</p>
          <p className="empty-hint">Click on calendar dates to select them</p>
        </div>
      </div>
    );
  }

  return (
    <div className="selected-dates-summary">
      <div className="summary-header">
        <h3 className="summary-title">
          Selected Dates
          <span className="total-count">({selectedDates.length})</span>
        </h3>
        
        {showActions && (
          <div className="summary-actions">
            <button 
              className="expand-all-btn"
              onClick={() => {
                if (expandedMonths.size === groupedDates.size) {
                  setExpandedMonths(new Set());
                } else {
                  setExpandedMonths(new Set(groupedDates.keys()));
                }
              }}
              title={expandedMonths.size === groupedDates.size ? 'Collapse all' : 'Expand all'}
            >
              {expandedMonths.size === groupedDates.size ? '⊟' : '⊞'}
            </button>
            
            <button 
              className={`clear-all-btn ${showClearConfirm ? 'confirm' : ''}`}
              onClick={handleClearAll}
              title={showClearConfirm ? 'Click again to confirm' : 'Clear all dates'}
            >
              {showClearConfirm ? 'Confirm Clear' : 'Clear All'}
            </button>
          </div>
        )}
      </div>

      <div 
        className="dates-container"
        style={{ maxHeight }}
      >
        {Array.from(groupedDates.entries()).map(([monthKey, monthData]) => (
          <MonthGroup
            key={monthKey}
            monthLabel={monthData.label}
            dates={monthData.dates}
            onRemoveDate={handleRemoveDate}
            isExpanded={expandedMonths.has(monthKey)}
            onToggle={() => toggleMonth(monthKey)}
          />
        ))}
      </div>

      {selectedDates.length > 0 && (
        <div className="summary-footer">
          <div className="summary-stats">
            <span className="stat-item">
              <strong>{selectedDates.length}</strong> day{selectedDates.length !== 1 ? 's' : ''} selected
            </span>
            {groupByMonth && groupedDates.size > 1 && (
              <span className="stat-item">
                across <strong>{groupedDates.size}</strong> month{groupedDates.size !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedDatesSummary;