'use client'

import OperatorSettingsForm from '../../components/OperatorSettingsForm';

export default function AdminSettingsPage() {
  const handleClose = () => {
    // For page usage, we can navigate back or just do nothing
    window.history.back();
  };

  return <OperatorSettingsForm onClose={handleClose} />;
}