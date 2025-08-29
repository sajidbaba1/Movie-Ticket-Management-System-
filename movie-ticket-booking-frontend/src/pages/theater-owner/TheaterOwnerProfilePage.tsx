import React from 'react';
import { Card } from '../../components/ui';

const TheaterOwnerProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile 👤</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <Card padding="lg" className="text-center">
          <div className="py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600">This feature is currently under development.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TheaterOwnerProfilePage;