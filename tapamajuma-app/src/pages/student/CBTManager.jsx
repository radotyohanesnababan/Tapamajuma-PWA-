import React, { useState, useEffect } from 'react';
import CBTStart from './CBTStart';
import CBTExam from './CBTExam';

const CBTManager = () => {
  const [step, setStep] = useState('token'); // 'token' atau 'exam'
  const [activeExam, setActiveExam] = useState(null);

  // Fitur Anti-Refresh: Cek jika ada sesi yang menggantung di browser
  useEffect(() => {
    const savedSession = sessionStorage.getItem('cbt_active_session');
    if (savedSession) {
      setActiveExam(JSON.parse(savedSession));
      setStep('exam');
    }
  }, []);

  const handleVerified = (examData) => {
    setActiveExam(examData);
    // Simpan ke sessionStorage agar kalau refresh tidak balik ke menu token
    sessionStorage.setItem('cbt_active_session', JSON.stringify(examData));
    setStep('exam');
  };

  const handleFinish = () => {
    sessionStorage.removeItem('cbt_active_session');
    setStep('token');
    setActiveExam(null);
  };

  return (
    <>
      {step === 'token' ? (
        <CBTStart onVerified={handleVerified} />
      ) : (
        <CBTExam examData={activeExam} onFinish={handleFinish} />
      )}
    </>
  );
};

export default CBTManager;