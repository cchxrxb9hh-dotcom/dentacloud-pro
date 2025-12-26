
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const { Navigate } = ReactRouterDOM;

/**
 * Dashboard has been removed in favor of a specialized Reports page.
 * Redirecting to home (Appointments).
 */
const Dashboard: React.FC = () => {
  return <Navigate to="/" replace />;
};

export default Dashboard;
