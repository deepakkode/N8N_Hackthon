import React from 'react';
import CreateEventWizard from './CreateEventWizard';

const AddEventModal = ({ onClose, onAddEvent }) => {
  return (
    <CreateEventWizard 
      onClose={onClose}
      onCreateEvent={onAddEvent}
    />
  );
};

export default AddEventModal;