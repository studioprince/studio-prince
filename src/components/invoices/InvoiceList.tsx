import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { FileText, Eye, X, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const InvoiceList = () => {
  const { user, token } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!token) return;
      try {
        const response = await fetch('/api/invoices', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setInvoices(data);
        }
      } catch (error) {
        console.error("Failed to fetch invoices", error);
      }
    };

    fetchInvoices();
  }, [token]);

  // Function to handle printing/downloading (mockup for now)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-playfair font-semibold">Your Invoices</h2>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No invoices found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice._id || invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.description}</div>
                      <div className="text-xs text-gray-500">#{invoice._id?.slice(-6) || invoice.id?.slice(-6)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.createdAt ? format(new Date(invoice.createdAt), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${invoice.amount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'}`}>
                        {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="text-gray-500 hover:text-primary transition-colors p-1 rounded-full hover:bg-gray-100"
                        title="View Invoice"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 print:p-0 print:bg-white print:absolute print:inset-0">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col print:shadow-none print:max-h-none print:w-full print:max-w-none">
            {/* Modal Header (Hidden in Print) */}
            <div className="flex justify-between items-center p-4 border-b print:hidden">
              <h3 className="font-semibold text-gray-700">Invoice Details</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md flex items-center gap-1 text-sm"
                >
                  <Download className="h-4 w-4" />
                  Print/Download
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Invoice Content */}
            <div className="p-8 print:p-8">
              {/* Letterhead Spacer */}
              <div className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 mb-8 flex items-center justify-center rounded-lg print:border-none print:bg-transparent">
                <div className="text-center text-gray-400 print:hidden">
                  <span className="block text-sm font-medium">Letterhead Space</span>
                  <span className="text-xs">(Logo & Branding Header)</span>
                </div>
              </div>

              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-2 tracking-tight">INVOICE</h1>
                  <p className="text-gray-500 font-mono">#{selectedInvoice._id?.slice(-8).toUpperCase() || selectedInvoice.id}</p>
                  <div className="mt-4">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${selectedInvoice.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                        selectedInvoice.status === 'sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                      {selectedInvoice.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-gray-900">{selectedInvoice.adminName || 'Studio Admin'}</h2>
                  <p className="text-gray-600">Photography Studio</p> {/* Contextual name */}
                  <p className="text-gray-500 text-sm mt-1">studio@example.com</p>
                </div>
              </div>

              {/* Bill To & Details */}
              <div className="flex flex-col md:flex-row justify-between mb-12 gap-8">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
                  <div className="text-gray-900">
                    <p className="font-semibold text-lg">{user?.name}</p>
                    <p className="text-gray-600">{user?.email}</p>
                    {user?.phone && <p className="text-gray-600">{user.phone}</p>}
                  </div>
                </div>
                <div className="md:text-right">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Details</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between md:justify-end gap-4">
                      <span className="text-gray-600">Invoice Date:</span>
                      <span className="font-medium text-gray-900">{selectedInvoice.createdAt ? format(new Date(selectedInvoice.createdAt), 'MMM d, yyyy') : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between md:justify-end gap-4">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-medium text-gray-900">{selectedInvoice.dueDate ? format(new Date(selectedInvoice.dueDate), 'MMM d, yyyy') : 'N/A'}</span>
                    </div>
                    {selectedInvoice.bookingId && (
                      <div className="flex justify-between md:justify-end gap-4">
                        <span className="text-gray-600">Booking Ref:</span>
                        <span className="font-medium text-gray-900 font-mono">#{selectedInvoice.bookingId.toString().slice(-6).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-10">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left py-3 text-sm font-semibold text-gray-600">Description</th>
                      <th className="text-right py-3 text-sm font-semibold text-gray-600">Qty</th>
                      <th className="text-right py-3 text-sm font-semibold text-gray-600">Price</th>
                      <th className="text-right py-3 text-sm font-semibold text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedInvoice.items?.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-4 text-gray-900 font-medium">
                          {item.description}
                        </td>
                        <td className="py-4 text-right text-gray-600">{item.quantity}</td>
                        <td className="py-4 text-right text-gray-600">${item.unitPrice?.toFixed(2)}</td>
                        <td className="py-4 text-right text-gray-900 font-medium">${item.total?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex justify-end items-center gap-12">
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                    <p className="text-3xl font-playfair font-bold text-primary">${selectedInvoice.amount?.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Footer / Notes */}
              <div className="mt-16 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm">
                <p className="mb-2">Thank you for your business!</p>
                <p>For any queries regarding this invoice, please contact us.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
