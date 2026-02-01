import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import QrScanner from 'qr-scanner';
import { API_BASE_URL } from '../../config/api';
import './EventsManagement.css';

const EventsManagement = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [scannerMode, setScannerMode] = useState('camera'); // 'camera' or 'manual'
  const [qrScanner, setQrScanner] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Notification system
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view events');
        setLoading(false);
        return;
      }

      // Fetch all events based on user type
      const endpoint = user?.userType === 'organizer' 
        ? `${API_BASE_URL}/events/organizer/my-events`
        : `${API_BASE_URL}/events`;

      console.log('EventsManagement - Fetching events from:', endpoint);
      console.log('EventsManagement - User type:', user?.userType);

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('EventsManagement - Loaded', response.data?.length || 0, 'events');
      console.log('EventsManagement - Events data:', response.data);
      setEvents(response.data || []);
      setError('');
    } catch (error) {
      console.error('EventsManagement - Error fetching events:', error);
      setError(`Failed to load events: ${error.response?.data?.message || error.message}`);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventRegistrations = async (eventId) => {
    try {
      setRegistrationsLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('EventsManagement - Fetching registrations for event:', eventId);
      
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('EventsManagement - Loaded', response.data?.length || 0, 'registrations for event', eventId);
      console.log('EventsManagement - Registrations data:', response.data);
      setRegistrations(response.data || []);
    } catch (error) {
      console.error('EventsManagement - Error fetching registrations:', error);
      setRegistrations([]);
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const handleViewRegistrations = (event) => {
    setSelectedEvent(event);
    fetchEventRegistrations(event.id);
  };

  const updateRegistrationStatus = async (registrationId, status) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_BASE_URL}/events/${selectedEvent.id}/applications/${registrationId}`,
        { registrationStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh registrations
      fetchEventRegistrations(selectedEvent.id);
      
      console.log('Updated registration status to:', status);
    } catch (error) {
      console.error('Error updating registration:', error);
      alert('Failed to update registration status');
    }
  };

  const markAttendance = async (registrationId, attended = true) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_BASE_URL}/events/${selectedEvent.id}/attendance/${registrationId}`,
        { attended, attendedAt: attended ? new Date().toISOString() : null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh registrations to show updated attendance
      fetchEventRegistrations(selectedEvent.id);
      
      showNotification(`Attendance ${attended ? 'marked' : 'removed'} successfully!`);
      console.log('Updated attendance:', attended);
    } catch (error) {
      console.error('Error updating attendance:', error);
      showNotification('Failed to update attendance', 'error');
    }
  };

  const handleQRScan = async (qrData) => {
    try {
      setScannerLoading(true);
      
      // Parse QR code data
      const qrInfo = JSON.parse(qrData);
      const { eventId, userId, registrationId, studentName } = qrInfo;
      
      console.log('Processing QR scan:', qrInfo);
      console.log('Available registrations:', registrations.map(r => ({ id: r.id, userId: r.userId, userName: r.user?.name })));
      
      // Verify this QR is for the current event
      if (eventId !== selectedEvent.id) {
        showNotification('QR code is not for this event!', 'error');
        return;
      }
      
      // Find the registration - try by registrationId first, then by userId
      let registration = null;
      
      if (registrationId) {
        registration = registrations.find(reg => reg.id === registrationId);
        console.log('Found by registrationId:', registration);
      }
      
      if (!registration && userId) {
        registration = registrations.find(reg => 
          reg.userId === userId || reg.user?.id === userId
        );
        console.log('Found by userId:', registration);
      }
      
      if (!registration) {
        showNotification(`Registration not found for ${studentName || 'student'}!`, 'error');
        console.log('Registration not found for userId:', userId, 'registrationId:', registrationId);
        return;
      }
      
      console.log('Found registration:', registration);
      
      if (registration.attended) {
        showNotification(`${studentName || registration.user?.name || 'Student'} is already marked present!`, 'warning');
        return;
      }
      
      // Mark attendance
      await markAttendance(registration.id, true);
      
      showNotification(`${studentName || registration.user?.name || 'Student'} marked present successfully!`);
      
      // Close scanner and stop camera after successful scan
      setShowQRScanner(false);
      stopCamera();
      
    } catch (error) {
      console.error('QR Scan error:', error);
      showNotification('Invalid QR code format!', 'error');
    } finally {
      setScannerLoading(false);
    }
  };

  // Camera functions
  const startCamera = async () => {
    try {
      if (videoRef.current) {
        // Create QR scanner instance
        const scanner = new QrScanner(
          videoRef.current,
          (result) => {
            console.log('QR Code detected:', result.data);
            handleQRScan(result.data);
          },
          {
            onDecodeError: (error) => {
              // Silently handle decode errors (normal when no QR code is visible)
              console.log('QR decode attempt:', error.message);
            },
            preferredCamera: 'user', // Use front camera
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 5,
          }
        );

        setQrScanner(scanner);
        await scanner.start();
        console.log('QR Scanner started successfully');
      }
    } catch (error) {
      console.error('Camera access error:', error);
      showNotification('Camera access denied. Please allow camera access or use manual input.', 'error');
      setScannerMode('manual');
    }
  };

  const stopCamera = () => {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
      setQrScanner(null);
      console.log('QR Scanner stopped');
    }
  };

  // Start camera when scanner opens
  useEffect(() => {
    if (showQRScanner && scannerMode === 'camera') {
      startCamera();
    }
    return () => {
      if (showQRScanner === false) {
        stopCamera();
      }
    };
  }, [showQRScanner, scannerMode]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getFilteredEvents = () => {
    return events.filter(event => {
      const matchesSearch = event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  };

  const getFilteredRegistrations = () => {
    return registrations.filter(registration => {
      if (statusFilter === 'all') return true;
      return registration.registrationStatus === statusFilter;
    });
  };

  const getEventStats = (event) => {
    const eventRegistrations = registrations.filter(reg => reg.eventId === event.id);
    const approved = eventRegistrations.filter(reg => reg.registrationStatus === 'approved').length;
    const pending = eventRegistrations.filter(reg => reg.registrationStatus === 'pending').length;
    const rejected = eventRegistrations.filter(reg => reg.registrationStatus === 'rejected').length;
    
    return { total: eventRegistrations.length, approved, pending, rejected };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Download functions
  const downloadCSV = async () => {
    if (!selectedEvent || filteredRegistrations.length === 0) {
      alert('No registration data to download');
      return;
    }

    try {
      // Try to use backend API for CSV export
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/events/${selectedEvent.id}/export?format=csv`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${selectedEvent.name.replace(/[^a-z0-9]/gi, '_')}_registrations.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('CSV file downloaded successfully!');
    } catch (error) {
      console.error('Backend CSV export failed, using client-side generation:', error);
      
      // Fallback to client-side CSV generation
      const headers = [
        'Registration #',
        'Student Name',
        'Email',
        'Department',
        'Year',
        'Section',
        'Phone',
        'Registration Date',
        'Status',
        'Payment Status'
      ];

      const csvData = filteredRegistrations.map((registration, index) => [
        `#${String(registration.id).padStart(4, '0')}`,
        registration.user?.name || registration.name || 'N/A',
        registration.user?.email || registration.email || 'N/A',
        registration.formData?.department || registration.department || 'N/A',
        registration.formData?.year || registration.year || 'N/A',
        registration.formData?.section || registration.section || 'N/A',
        registration.formData?.phone || registration.phone || 'N/A',
        formatDate(registration.createdAt),
        registration.registrationStatus,
        registration.paymentStatus || 'pending'
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${selectedEvent.name.replace(/[^a-z0-9]/gi, '_')}_registrations.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('CSV file downloaded successfully!');
    }
  };

  const downloadExcel = () => {
    if (!selectedEvent || filteredRegistrations.length === 0) {
      alert('No registration data to download');
      return;
    }

    // Create Excel-compatible HTML table
    const headers = [
      'Registration #',
      'Student Name',
      'Email',
      'Department',
      'Year',
      'Section',
      'Phone',
      'Registration Date',
      'Status',
      'Payment Status'
    ];

    const tableRows = filteredRegistrations.map((registration, index) => `
      <tr>
        <td>#${String(registration.id).padStart(4, '0')}</td>
        <td>${registration.user?.name || registration.name || 'N/A'}</td>
        <td>${registration.user?.email || registration.email || 'N/A'}</td>
        <td>${registration.formData?.department || registration.department || 'N/A'}</td>
        <td>${registration.formData?.year || registration.year || 'N/A'}</td>
        <td>${registration.formData?.section || registration.section || 'N/A'}</td>
        <td>${registration.formData?.phone || registration.phone || 'N/A'}</td>
        <td>${formatDate(registration.createdAt)}</td>
        <td>${registration.registrationStatus}</td>
        <td>${registration.paymentStatus || 'pending'}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>${selectedEvent.name} - Registrations</title>
        </head>
        <body>
          <h2>${selectedEvent.name} - Registration Data</h2>
          <p>Event Date: ${formatDate(selectedEvent.date)}</p>
          <p>Venue: ${selectedEvent.venue}</p>
          <p>Total Registrations: ${filteredRegistrations.length}</p>
          <br>
          <table border="1" style="border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                ${headers.map(header => `<th style="padding: 8px;">${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedEvent.name.replace(/[^a-z0-9]/gi, '_')}_registrations.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Excel file downloaded successfully!');
  };

  const downloadPDF = () => {
    if (!selectedEvent || filteredRegistrations.length === 0) {
      alert('No registration data to download');
      return;
    }

    // Create a printable HTML page
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${selectedEvent.name} - Registrations</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .event-info { margin-bottom: 20px; padding: 15px; background-color: #f5f5f5; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .status-approved { color: #28a745; font-weight: bold; }
            .status-pending { color: #ffc107; font-weight: bold; }
            .status-rejected { color: #dc3545; font-weight: bold; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${selectedEvent.name}</h1>
            <h3>Registration Report</h3>
          </div>
          
          <div class="event-info">
            <p><strong>Event Date:</strong> ${formatDate(selectedEvent.date)}</p>
            <p><strong>Venue:</strong> ${selectedEvent.venue}</p>
            <p><strong>Organizer:</strong> ${selectedEvent.organizer?.name || 'N/A'}</p>
            <p><strong>Total Registrations:</strong> ${filteredRegistrations.length}</p>
            <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Reg #</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Year</th>
                <th>Phone</th>
                <th>Registration Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRegistrations.map((registration, index) => `
                <tr>
                  <td>#${String(registration.id).padStart(4, '0')}</td>
                  <td>${registration.user?.name || registration.name || 'N/A'}</td>
                  <td>${registration.user?.email || registration.email || 'N/A'}</td>
                  <td>${registration.formData?.department || registration.department || 'N/A'}</td>
                  <td>${registration.formData?.year || registration.year || 'N/A'}</td>
                  <td>${registration.formData?.phone || registration.phone || 'N/A'}</td>
                  <td>${formatDate(registration.createdAt)}</td>
                  <td class="status-${registration.registrationStatus}">${registration.registrationStatus}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print / Save as PDF</button>
            <button onclick="window.close()" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    showNotification('PDF report opened in new window!');
  };

  const downloadAttendanceSheet = () => {
    if (!selectedEvent || filteredRegistrations.length === 0) {
      alert('No registration data to download');
      return;
    }

    // Create attendance tracking sheet
    const attendanceContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${selectedEvent.name} - Attendance Sheet</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .event-info { margin-bottom: 20px; padding: 15px; background-color: #f5f5f5; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .signature-col { width: 150px; }
            .attendance-col { width: 100px; text-align: center; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${selectedEvent.name}</h1>
            <h3>Attendance Tracking Sheet</h3>
          </div>
          
          <div class="event-info">
            <p><strong>Event Date:</strong> ${formatDate(selectedEvent.date)}</p>
            <p><strong>Venue:</strong> ${selectedEvent.venue}</p>
            <p><strong>Time:</strong> ${selectedEvent.time}</p>
            <p><strong>Total Registered:</strong> ${filteredRegistrations.filter(r => r.registrationStatus === 'approved').length}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Reg #</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Year</th>
                <th class="attendance-col">Present</th>
                <th class="signature-col">Signature</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRegistrations
                .filter(r => r.registrationStatus === 'approved')
                .map((registration, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>#${String(registration.id).padStart(4, '0')}</td>
                  <td>${registration.user?.name || registration.name || 'N/A'}</td>
                  <td>${registration.formData?.department || registration.department || 'N/A'}</td>
                  <td>${registration.formData?.year || registration.year || 'N/A'}</td>
                  <td class="attendance-col">☐</td>
                  <td class="signature-col"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 50px;">
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>Mark ☑ in the "Present" column for attendees</li>
              <li>Get signature from each attendee</li>
              <li>Keep this sheet for record keeping</li>
            </ul>
          </div>

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Attendance Sheet</button>
            <button onclick="window.close()" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(attendanceContent);
    printWindow.document.close();
    showNotification('Attendance sheet opened in new window!');
  };

  const downloadAllEventsReport = () => {
    if (filteredEvents.length === 0) {
      alert('No events data to download');
      return;
    }

    // Create comprehensive events report
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Events Management Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin-bottom: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; }
            .event-section { margin-bottom: 40px; page-break-inside: avoid; }
            .event-header { background-color: #667eea; color: white; padding: 15px; border-radius: 8px 8px 0 0; }
            .event-details { padding: 15px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-item { text-align: center; }
            .stat-number { font-size: 2em; font-weight: bold; color: #667eea; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Events Management Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="summary">
            <h2>Summary</h2>
            <div class="stats">
              <div class="stat-item">
                <div class="stat-number">${filteredEvents.length}</div>
                <div>Total Events</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${filteredEvents.filter(e => e.isPublished).length}</div>
                <div>Published</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${filteredEvents.reduce((sum, e) => sum + (e.registrations?.length || 0), 0)}</div>
                <div>Total Registrations</div>
              </div>
            </div>
          </div>

          ${filteredEvents.map(event => `
            <div class="event-section">
              <div class="event-header">
                <h3>${event.name}</h3>
              </div>
              <div class="event-details">
                <p><strong>Date:</strong> ${formatDate(event.date)} at ${event.time}</p>
                <p><strong>Venue:</strong> ${event.venue}</p>
                <p><strong>Organizer:</strong> ${event.organizer?.name || 'Unknown'}</p>
                <p><strong>Status:</strong> ${event.isPublished ? 'Published' : 'Draft'}</p>
                <p><strong>Registrations:</strong> ${event.registrations?.length || 0}</p>
                <p><strong>Description:</strong> ${event.description}</p>
              </div>
            </div>
          `).join('')}

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print / Save as PDF</button>
            <button onclick="window.close()" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportContent);
    printWindow.document.close();
    showNotification('Events report opened in new window!');
  };

  if (loading) {
    return (
      <div className="events-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  const filteredEvents = getFilteredEvents();
  const filteredRegistrations = getFilteredRegistrations();

  return (
    <div className="events-management">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              {notification.type === 'success' ? (
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              ) : (
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              )}
            </svg>
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="notification-close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="management-header">
        <div className="header-content">
          <h1>Events Management</h1>
          <p>Manage events and track registrations</p>
          
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="management-content">
        {error && <div className="error-banner">{error}</div>}
        
        {!selectedEvent ? (
          // Events List View
          <div className="events-section">
            <div className="section-header">
              <h2>All Events ({filteredEvents.length})</h2>
              {filteredEvents.length > 0 && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => downloadAllEventsReport()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Download Events Report
                </button>
              )}
            </div>
            
            {filteredEvents.length === 0 ? (
              <div className="no-content">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <h3>No events found</h3>
                <p>
                  {searchTerm 
                    ? 'No events match your search criteria'
                    : 'No events have been created yet'
                  }
                </p>
              </div>
            ) : (
              <div className="events-table">
                <div className="table-header">
                  <div className="header-cell">Event Name</div>
                  <div className="header-cell">Date</div>
                  <div className="header-cell">Organizer</div>
                  <div className="header-cell">Status</div>
                  <div className="header-cell">Registrations</div>
                  <div className="header-cell">Actions</div>
                </div>
                
                {filteredEvents.map(event => (
                  <div key={event.id} className="table-row">
                    <div className="table-cell">
                      <div className="event-info">
                        <h4>{event.name}</h4>
                        <p>{event.venue}</p>
                      </div>
                    </div>
                    <div className="table-cell">
                      <div className="date-info">
                        <span className="date">{formatDate(event.date)}</span>
                        <span className="time">{event.time}</span>
                      </div>
                    </div>
                    <div className="table-cell">
                      <div className="organizer-info">
                        <span className="name">{event.organizer?.name || 'Unknown'}</span>
                        <span className="email">{event.organizer?.email}</span>
                      </div>
                    </div>
                    <div className="table-cell">
                      <span className={`status-badge ${event.isPublished ? 'published' : 'draft'}`}>
                        {event.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="table-cell">
                      <div className="registration-count">
                        <span className="count">{event.registrations?.length || 0}</span>
                        <span className="label">registrations</span>
                      </div>
                    </div>
                    <div className="table-cell">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleViewRegistrations(event)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Event Details View
          <div className="event-details-section">
            <div className="details-header">
              <button 
                className="back-btn"
                onClick={() => setSelectedEvent(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Back to Events
              </button>
              
              <div className="event-title">
                <h2>{selectedEvent.name}</h2>
                <p>{selectedEvent.description}</p>
              </div>
            </div>
            
            {/* Event Info */}
            <div className="event-info-card">
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Date & Time</span>
                  <span className="value">{formatDate(selectedEvent.date)} at {selectedEvent.time}</span>
                </div>
                <div className="info-item">
                  <span className="label">Venue</span>
                  <span className="value">{selectedEvent.venue}</span>
                </div>
                <div className="info-item">
                  <span className="label">Max Participants</span>
                  <span className="value">{selectedEvent.maxParticipants || 'Unlimited'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Payment Required</span>
                  <span className="value">{selectedEvent.paymentRequired ? `₹${selectedEvent.paymentAmount}` : 'Free'}</span>
                </div>
              </div>
            </div>
            
            {/* Registrations */}
            <div className="registrations-section">
              <div className="registrations-header">
                <h3>Registrations ({filteredRegistrations.length})</h3>
                
                <div className="header-actions">
                  <div className="status-filters">
                    <button 
                      className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setStatusFilter('all')}
                    >
                      All
                    </button>
                    <button 
                      className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                      onClick={() => setStatusFilter('pending')}
                    >
                      Pending
                    </button>
                    <button 
                      className={`filter-btn ${statusFilter === 'approved' ? 'active' : ''}`}
                      onClick={() => setStatusFilter('approved')}
                    >
                      Approved
                    </button>
                    <button 
                      className={`filter-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
                      onClick={() => setStatusFilter('rejected')}
                    >
                      Rejected
                    </button>
                  </div>

                  {filteredRegistrations.length > 0 && (
                    <div className="download-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowQRScanner(true)}
                        style={{ marginRight: '1rem' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                          <rect x="7" y="7" width="3" height="3" stroke="currentColor" strokeWidth="2"/>
                          <rect x="14" y="7" width="3" height="3" stroke="currentColor" strokeWidth="2"/>
                          <rect x="7" y="14" width="3" height="3" stroke="currentColor" strokeWidth="2"/>
                          <line x1="14" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2"/>
                          <line x1="14" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="2"/>
                          <line x1="14" y1="17" x2="17" y2="17" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Scan QR Code
                      </button>
                      
                      <div className="dropdown">
                        <button className="btn btn-success dropdown-toggle">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2"/>
                            <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
                            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Download Data
                        </button>
                        <div className="dropdown-menu">
                          <button onClick={downloadCSV} className="dropdown-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                              <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            CSV File
                          </button>
                          <button onClick={downloadExcel} className="dropdown-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                              <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Excel File
                          </button>
                          <button onClick={downloadPDF} className="dropdown-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                              <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            PDF Report
                          </button>
                          <button onClick={downloadAttendanceSheet} className="dropdown-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Attendance Sheet
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {registrationsLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading registrations...</p>
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="no-registrations">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 1.17157 16.1716C0.421427 16.9217 0 17.9391 0 19V21" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2"/>
                    <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <h4>No registrations found</h4>
                  <p>No one has registered for this event yet.</p>
                </div>
              ) : (
                <div className="registrations-table">
                  <div className="table-header">
                    <div className="header-cell">Registration #</div>
                    <div className="header-cell">Student Name</div>
                    <div className="header-cell">Email</div>
                    <div className="header-cell">Registration Date</div>
                    <div className="header-cell">Status</div>
                    <div className="header-cell">Payment</div>
                    <div className="header-cell">Attendance</div>
                    <div className="header-cell">Actions</div>
                  </div>
                  
                  {filteredRegistrations.map((registration, index) => (
                    <div key={registration.id} className="table-row">
                      <div className="table-cell">
                        <span className="registration-number">
                          #{String(registration.id).padStart(4, '0')}
                        </span>
                      </div>
                      <div className="table-cell">
                        <div className="student-info">
                          <span className="name">{registration.user?.name || registration.name || 'Unknown'}</span>
                          <span className="details">
                            {registration.formData?.department || registration.department || 'N/A'} • Year {registration.formData?.year || registration.year || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="table-cell">
                        <span className="email">{registration.user?.email || registration.email || 'N/A'}</span>
                      </div>
                      <div className="table-cell">
                        <span className="date">{formatDate(registration.createdAt)}</span>
                      </div>
                      <div className="table-cell">
                        <span className={`status-badge ${registration.registrationStatus}`}>
                          {registration.registrationStatus}
                        </span>
                      </div>
                      <div className="table-cell">
                        <span className={`payment-badge ${registration.paymentStatus || 'pending'}`}>
                          {registration.paymentStatus || 'pending'}
                        </span>
                      </div>
                      <div className="table-cell">
                        <div className="attendance-status">
                          {registration.attended ? (
                            <div className="attendance-present">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              <span>Present</span>
                              {registration.attendedAt && (
                                <small>{new Date(registration.attendedAt).toLocaleTimeString()}</small>
                              )}
                            </div>
                          ) : (
                            <div className="attendance-absent">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              <span>Absent</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="table-cell">
                        <div className="action-buttons">
                          {registration.registrationStatus === 'pending' && (
                            <>
                              <button 
                                className="btn btn-success btn-xs"
                                onClick={() => updateRegistrationStatus(registration.id, 'approved')}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn btn-danger btn-xs"
                                onClick={() => updateRegistrationStatus(registration.id, 'rejected')}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {registration.registrationStatus === 'approved' && (
                            <>
                              {!registration.attended ? (
                                <button 
                                  className="btn btn-primary btn-xs"
                                  onClick={() => markAttendance(registration.id, true)}
                                >
                                  Mark Present
                                </button>
                              ) : (
                                <button 
                                  className="btn btn-warning btn-xs"
                                  onClick={() => markAttendance(registration.id, false)}
                                >
                                  Mark Absent
                                </button>
                              )}
                              <button 
                                className="btn btn-secondary btn-xs"
                                onClick={() => updateRegistrationStatus(registration.id, 'pending')}
                              >
                                Revert
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="modal-overlay">
          <div className="qr-scanner-modal">
            <div className="scanner-header">
              <h3>Scan Student QR Code</h3>
              <div className="scanner-mode-toggle">
                <button 
                  className={`mode-btn ${scannerMode === 'camera' ? 'active' : ''}`}
                  onClick={() => setScannerMode('camera')}
                >
                  Camera
                </button>
                <button 
                  className={`mode-btn ${scannerMode === 'manual' ? 'active' : ''}`}
                  onClick={() => setScannerMode('manual')}
                >
                  Manual
                </button>
              </div>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowQRScanner(false);
                  stopCamera();
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            
            <div className="scanner-content">
              {scannerMode === 'camera' ? (
                <div className="camera-scanner">
                  <div className="scanner-instructions">
                    <p>Position the student's QR code in front of your laptop's camera:</p>
                  </div>
                  
                  <div className="camera-container">
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline
                      className="camera-video"
                    />
                    <canvas 
                      ref={canvasRef}
                      style={{ display: 'none' }}
                    />
                  </div>
                  
                  <div className="camera-instructions">
                    <p>Ask the student to show their QR code clearly to the camera</p>
                    <p>The QR code will be automatically detected and processed</p>
                    <p>QR codes will be highlighted when detected</p>
                  </div>
                </div>
              ) : (
                <div className="manual-scanner">
                  <div className="scanner-instructions">
                    <p>Ask the student to copy their QR code data and paste it below:</p>
                  </div>
                  
                  <div className="qr-scanner-area">
                    <div className="scanner-frame">
                      <div className="scanner-corners">
                        <div className="corner top-left"></div>
                        <div className="corner top-right"></div>
                        <div className="corner bottom-left"></div>
                        <div className="corner bottom-right"></div>
                      </div>
                      <div className="scanner-line"></div>
                    </div>
                    
                    <div className="scanner-controls">
                      <input
                        type="text"
                        placeholder="Paste QR code data here and press Enter..."
                        className="qr-input"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            handleQRScan(e.target.value.trim());
                            e.target.value = '';
                          }
                        }}
                      />
                      <p className="scanner-help">
                        Student can copy QR data from their My Events page and paste it here
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {scannerLoading && (
                <div className="scanner-loading">
                  <div className="loading-spinner"></div>
                  <p>Processing QR code...</p>
                  <p>Marking attendance...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManagement;