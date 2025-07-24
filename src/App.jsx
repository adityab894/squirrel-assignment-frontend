import React, { useState } from 'react';
import DoctorForm from './components/DoctorForm';
import PatientSearch from './components/PatientSearch';

function App() {
  const [role, setRole] = useState('doctor');

  return (
    <div className="app-container">
      <div >
        <button onClick={() => setRole('doctor')} disabled={role === 'doctor'}>
          Doctor
        </button>
        <button onClick={() => setRole('patient')} disabled={role === 'patient'} style={{ marginLeft: 8 }}>
          Patient
        </button>
      </div>
      {role === 'doctor' ? <DoctorForm /> : <PatientSearch />}
    </div>
  );
}

export default App;
