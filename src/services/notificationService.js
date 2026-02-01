// Real-time Notification Service
import { API_BASE_URL } from '../config/api';

class NotificationService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.notifications = [];
    this.listeners = new Map();
    this.user = null;
    
    // Notification types
    this.TYPES = {
      EVENT_REGISTRATION: 'event_registration',
      EVENT_APPROVAL: 'event_approval',
      EVENT_REMINDER: 'event_reminder',
      EVENT_UPDATE: 'event_update',
      EVENT_CANCELLED: 'event_cancelled',
      ATTENDANCE_MARKED: 'attendance_marked',
      CLUB_VERIFICATION: 'club_verification',
      SYSTEM_ANNOUNCEMENT: 'system_announcement'
    };
  }

  // Initialize the notification service
  init(user) {
    this.user = user;
    if (user && user.isEmailVerified) {
      this.connect();
      this.requestNotificationPermission();
    }
  }

  // Connect to WebSocket server
  connect() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Notifications: No token available');
        return;
      }

      // Create WebSocket connection
      const wsUrl = API_BASE_URL.replace('http', 'ws') + '/ws';
      this.socket = new WebSocket(`${wsUrl}?token=${token}`);

      this.socket.onopen = () => {
        console.log('Notifications: Connected to WebSocket');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.socket.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          this.handleNotification(notification);
        } catch (error) {
          console.error('Notifications: Failed to parse message', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('Notifications: WebSocket closed', event.code, event.reason);
        this.isConnected = false;
        this.emit('disconnected');
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`Notifications: Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.connect();
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };

      this.socket.onerror = (error) => {
        console.error('Notifications: WebSocket error', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Notifications: Failed to connect', error);
    }
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Handle incoming notifications
  handleNotification(notification) {
    console.log('Notifications: Received', notification);
    
    // Add to notifications list
    this.notifications.unshift({
      ...notification,
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false
    });

    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    // Show browser notification
    this.showBrowserNotification(notification);
    
    // Show in-app notification
    this.showInAppNotification(notification);
    
    // Emit to listeners
    this.emit('notification', notification);
  }

  // Show browser notification
  async showBrowserNotification(notification) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const options = {
      body: notification.message,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: notification.type,
      requireInteraction: notification.priority === 'high',
      vibrate: [100, 50, 100],
      data: notification,
      actions: this.getNotificationActions(notification)
    };

    try {
      const browserNotification = new Notification(notification.title, options);
      
      browserNotification.onclick = () => {
        window.focus();
        this.handleNotificationClick(notification);
        browserNotification.close();
      };

      // Auto close after 5 seconds for low priority notifications
      if (notification.priority !== 'high') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }

    } catch (error) {
      console.error('Notifications: Failed to show browser notification', error);
    }
  }

  // Show in-app notification
  showInAppNotification(notification) {
    const notificationElement = document.createElement('div');
    notificationElement.className = `in-app-notification ${notification.type} ${notification.priority || 'normal'}`;
    notificationElement.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">
          ${this.getNotificationIcon(notification.type)}
        </div>
        <div class="notification-text">
          <h4>${notification.title}</h4>
          <p>${notification.message}</p>
          <small>${new Date().toLocaleTimeString()}</small>
        </div>
        <div class="notification-actions">
          ${this.getInAppActions(notification)}
          <button class="close-notification" onclick="this.parentElement.parentElement.parentElement.remove()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Add to page
    document.body.appendChild(notificationElement);

    // Add styles if not already added
    this.addNotificationStyles();

    // Auto remove after delay
    const autoRemoveDelay = notification.priority === 'high' ? 10000 : 5000;
    setTimeout(() => {
      if (notificationElement.parentNode) {
        notificationElement.remove();
      }
    }, autoRemoveDelay);
  }

  // Get notification icon based on type
  getNotificationIcon(type) {
    const icons = {
      [this.TYPES.EVENT_REGISTRATION]: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 1.17157 16.1716C0.421427 16.9217 0 17.9391 0 19V21" stroke="currentColor" strokeWidth="2"/>
          <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2"/>
          <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2"/>
        </svg>
      `,
      [this.TYPES.EVENT_APPROVAL]: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      `,
      [this.TYPES.EVENT_REMINDER]: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
        </svg>
      `,
      [this.TYPES.EVENT_UPDATE]: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2"/>
          <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2"/>
          <path d="M20.49 9C20.0295 7.90743 19.3082 6.94332 18.3875 6.18619C17.4668 5.42906 16.3743 4.89797 15.1992 4.63399C14.0241 4.37 12.7982 4.38134 11.6286 4.66693C10.459 4.95252 9.37737 5.50423 8.47 6.28L1 4V10" stroke="currentColor" strokeWidth="2"/>
        </svg>
      `,
      [this.TYPES.ATTENDANCE_MARKED]: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      `
    };

    return icons[type] || `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
        <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/>
      </svg>
    `;
  }

  // Get notification actions for browser notifications
  getNotificationActions(notification) {
    const actions = [];

    if (notification.type === this.TYPES.EVENT_REGISTRATION) {
      actions.push({ action: 'view', title: 'View Event' });
    } else if (notification.type === this.TYPES.EVENT_APPROVAL) {
      actions.push({ action: 'view', title: 'View Details' });
    } else if (notification.type === this.TYPES.EVENT_REMINDER) {
      actions.push({ action: 'view', title: 'View Event' });
    }

    actions.push({ action: 'dismiss', title: 'Dismiss' });
    return actions;
  }

  // Get in-app notification actions
  getInAppActions(notification) {
    let actions = '';

    if (notification.type === this.TYPES.EVENT_REGISTRATION) {
      actions += `<button class="notification-action primary" onclick="notificationService.handleNotificationClick(${JSON.stringify(notification).replace(/"/g, '&quot;')})">View Event</button>`;
    } else if (notification.type === this.TYPES.EVENT_APPROVAL) {
      actions += `<button class="notification-action primary" onclick="notificationService.handleNotificationClick(${JSON.stringify(notification).replace(/"/g, '&quot;')})">View Details</button>`;
    } else if (notification.type === this.TYPES.EVENT_REMINDER) {
      actions += `<button class="notification-action primary" onclick="notificationService.handleNotificationClick(${JSON.stringify(notification).replace(/"/g, '&quot;')})">View Event</button>`;
    }

    return actions;
  }

  // Handle notification click
  handleNotificationClick(notification) {
    console.log('Notification clicked:', notification);
    
    // Navigate based on notification type
    if (notification.type === this.TYPES.EVENT_REGISTRATION || 
        notification.type === this.TYPES.EVENT_REMINDER) {
      // Navigate to events page
      window.location.hash = '#events';
    } else if (notification.type === this.TYPES.EVENT_APPROVAL) {
      // Navigate to my events page
      window.location.hash = '#my-events';
    } else if (notification.type === this.TYPES.ATTENDANCE_MARKED) {
      // Navigate to events management
      window.location.hash = '#events-management';
    }

    // Mark as read
    this.markAsRead(notification.id);
  }

  // Request notification permission
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('Notifications: Browser notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Notifications: Permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Add notification styles
  addNotificationStyles() {
    if (document.getElementById('notification-styles')) {
      return; // Already added
    }

    const styles = `
      .in-app-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.3);
        animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
      }

      .in-app-notification.high {
        border-left: 4px solid #ef4444;
      }

      .in-app-notification.event_approval {
        border-left: 4px solid #10b981;
      }

      .in-app-notification.event_registration {
        border-left: 4px solid #3b82f6;
      }

      .notification-content {
        padding: 20px;
        display: flex;
        align-items: flex-start;
        gap: 16px;
      }

      .notification-icon {
        color: #667eea;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .notification-text {
        flex: 1;
      }

      .notification-text h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
      }

      .notification-text p {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: #64748b;
        line-height: 1.4;
      }

      .notification-text small {
        font-size: 12px;
        color: #94a3b8;
      }

      .notification-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: flex-end;
      }

      .notification-action {
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .notification-action.primary {
        background: #667eea;
        color: white;
      }

      .notification-action.primary:hover {
        background: #5a67d8;
      }

      .close-notification {
        background: #f1f5f9;
        border: none;
        border-radius: 4px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #64748b;
        transition: all 0.2s ease;
      }

      .close-notification:hover {
        background: #e2e8f0;
        color: #475569;
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @media (max-width: 768px) {
        .in-app-notification {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'notification-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  // Event listener system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Notification listener error:', error);
        }
      });
    }
  }

  // Utility methods
  getNotifications() {
    return this.notifications;
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.emit('read', notification);
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.emit('allRead');
  }

  clearAll() {
    this.notifications = [];
    this.emit('cleared');
  }

  // Send test notification (for development)
  sendTestNotification() {
    const testNotification = {
      type: this.TYPES.EVENT_REGISTRATION,
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working.',
      priority: 'normal',
      data: { eventId: 'test-123' }
    };
    
    this.handleNotification(testNotification);
  }
}

// Create global instance
const notificationService = new NotificationService();

// Make it available globally for debugging
window.notificationService = notificationService;

export default notificationService;