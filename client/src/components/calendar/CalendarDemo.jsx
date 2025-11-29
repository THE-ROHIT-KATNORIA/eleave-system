import React, { useState } from 'react';
import CalendarLeaveForm from './CalendarLeaveForm';
import { formatDateForDisplay } from '../../utils/calendarUtils';

const CalendarDemo = () => {
  const [submissionResult, setSubmissionResult] = useState(null);

  const handleSubmitSuccess = (result) => {
    setSubmissionResult(result);
    console.log('Leave request submitted successfully:', result);
  };

  const handleCancel = () => {
    console.log('Form cancelled');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        Calendar Leave Selection Demo
      </h1>
      
      <div style={{ 
        padding: '20px', 
        background: 'linear-gradient(145deg, #e0e7ff, #c7d2fe)', 
        borderRadius: '15px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#4338ca', marginBottom: '10px' }}>
          📅 Monthly Leave Limit Demo
        </h3>
        <p style={{ color: '#3730a3', fontSize: '14px', margin: '0 0 10px 0' }}>
          <strong>Starting Balance:</strong> 3 leaves per month
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '10px',
          fontSize: '13px',
          color: '#3730a3'
        }}>
          <div>📅 <strong>Select 1 date:</strong> 2 leaves left</div>
          <div>📅📅 <strong>Select 2 dates:</strong> 1 leave left</div>
          <div>📅📅📅 <strong>Select 3 dates:</strong> All exhausted</div>
        </div>
      </div>

      {submissionResult ? (
        <div style={{ 
          padding: '30px', 
          background: 'linear-gradient(145deg, #f0fdf4, #dcfce7)', 
          borderRadius: '15px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#059669', marginBottom: '15px' }}>
            ✅ Leave Request Submitted Successfully!
          </h2>
          <p style={{ color: '#065f46', marginBottom: '10px' }}>
            <strong>Request ID:</strong> {submissionResult.leaveId}
          </p>
          <p style={{ color: '#065f46', marginBottom: '10px' }}>
            <strong>Dates Selected:</strong> {submissionResult.selectedDatesCount} day{submissionResult.selectedDatesCount !== 1 ? 's' : ''}
          </p>
          <p style={{ color: '#065f46', marginBottom: '10px' }}>
            <strong>Leave Impact:</strong> -{submissionResult.selectedDatesCount} from monthly limit
          </p>
          <p style={{ color: '#065f46', marginBottom: '20px' }}>
            <strong>Submitted At:</strong> {submissionResult.submittedAt.toLocaleString()}
          </p>
          <button 
            onClick={() => setSubmissionResult(null)}
            style={{
              padding: '10px 20px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Submit Another Request
          </button>
        </div>
      ) : (
        <CalendarLeaveForm
          onSubmitSuccess={handleSubmitSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default CalendarDemo;