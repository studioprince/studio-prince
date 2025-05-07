import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const InvoiceList = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  
  useEffect(() => {
    // Load invoices - removed role checks
    // Instead of checking user.role, we'll just show content for all users
    setInvoices([]);
  }, [user]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-playfair font-semibold">Your Invoices</h2>
      </div>
      
      <p className="text-gray-500 text-center py-10">No invoices found.</p>
    </div>
  );
};

export default InvoiceList;
