// PWA Service - Handle Progressive Web App features
class PWAService {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator;
    this.registration = null;
    this.deferredPrompt = null;
    this.isInstalled = false;
    
    this.init();
  }

  async init() {
    if (!this.isSupported) {
      console.log('PWA: Service Workers not supported');
      return;
    }

    // Register service worker
    await this.registerServiceWorker();
    
    // Setup install prompt
    this.setupInstallPrompt();
    
    // Check if already installed
    this.checkInstallStatus();
    
    // Setup push notifications
    this.setupPushNotifications();
  }

  async registerServiceWorker() {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('PWA: Service Worker registered successfully');
      
      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            this.showUpdateNotification();
          }
        });
      });
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('PWA: Message from service worker', event.data);
      });
      
    } catch (error) {
      console.error('PWA: Service Worker registration failed', error);
    }
  }

  setupInstallPrompt() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (event) => {
      console.log('PWA: Install prompt available');
      
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      
      // Save the event so it can be triggered later
      this.deferredPrompt = event;
      
      // Show custom install button
      this.showInstallButton();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed successfully');
      this.isInstalled = true;
      this.hideInstallButton();
      this.showInstalledNotification();
    });
  }

  checkInstallStatus() {
    // Check if running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      this.isInstalled = true;
      console.log('PWA: App is running in standalone mode');
    }
  }

  async showInstallPrompt() {
    if (!this.deferredPrompt) {
      console.log('PWA: Install prompt not available');
      return false;
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log('PWA: Install prompt outcome:', outcome);
      
      // Clear the deferred prompt
      this.deferredPrompt = null;
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('PWA: Install prompt failed', error);
      return false;
    }
  }

  showInstallButton() {
    // Create and show install button
    const installButton = document.createElement('button');
    installButton.id = 'pwa-install-button';
    installButton.className = 'pwa-install-btn';
    installButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2"/>
        <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
        <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
      </svg>
      Install App
    `;
    
    installButton.addEventListener('click', () => {
      this.showInstallPrompt();
    });
    
    // Add to page
    document.body.appendChild(installButton);
    
    // Add CSS styles
    this.addInstallButtonStyles();
  }

  hideInstallButton() {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.remove();
    }
  }

  addInstallButtonStyles() {
    const styles = `
      .pwa-install-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 50px;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        animation: slideInUp 0.5s ease-out;
      }
      
      .pwa-install-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
      }
      
      @keyframes slideInUp {
        from {
          transform: translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      @media (max-width: 768px) {
        .pwa-install-btn {
          bottom: 80px;
          right: 16px;
          padding: 10px 16px;
          font-size: 13px;
        }
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  showUpdateNotification() {
    // Create update notification
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
      <div class="update-content">
        <div class="update-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.49 9C20.0295 7.90743 19.3082 6.94332 18.3875 6.18619C17.4668 5.42906 16.3743 4.89797 15.1992 4.63399C14.0241 4.37 12.7982 4.38134 11.6286 4.66693C10.459 4.95252 9.37737 5.50423 8.47 6.28L1 4V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.51 15C3.97053 16.0926 4.69184 17.0567 5.61256 17.8138C6.53328 18.5709 7.62574 19.102 8.80081 19.366C9.97588 19.63 11.2018 19.6187 12.3714 19.3331C13.541 19.0475 14.6226 18.4958 15.53 17.72L23 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div class="update-text">
          <h4>New version available!</h4>
          <p>Update now to get the latest features</p>
        </div>
        <div class="update-actions">
          <button class="update-btn" onclick="pwaService.updateApp()">Update</button>
          <button class="dismiss-btn" onclick="this.parentElement.parentElement.parentElement.remove()">Later</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    this.addUpdateNotificationStyles();
  }

  addUpdateNotificationStyles() {
    const styles = `
      .pwa-update-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.3);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .update-content {
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      .update-icon {
        color: #667eea;
        flex-shrink: 0;
      }
      
      .update-text h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
      }
      
      .update-text p {
        margin: 0;
        font-size: 14px;
        color: #64748b;
      }
      
      .update-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-left: auto;
      }
      
      .update-btn, .dismiss-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .update-btn {
        background: #667eea;
        color: white;
      }
      
      .update-btn:hover {
        background: #5a67d8;
      }
      
      .dismiss-btn {
        background: #f1f5f9;
        color: #64748b;
      }
      
      .dismiss-btn:hover {
        background: #e2e8f0;
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
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  async updateApp() {
    if (!this.registration || !this.registration.waiting) {
      console.log('PWA: No update available');
      return;
    }

    // Tell the waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload the page to activate the new service worker
    window.location.reload();
  }

  showInstalledNotification() {
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'pwa-success-notification';
    notification.innerHTML = `
      <div class="success-content">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <span>Vivento installed successfully!</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
    
    this.addSuccessNotificationStyles();
  }

  addSuccessNotificationStyles() {
    const styles = `
      .pwa-success-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        z-index: 10000;
        animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .success-content {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 500;
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  async setupPushNotifications() {
    if (!('Notification' in window) || !this.registration) {
      console.log('PWA: Push notifications not supported');
      return;
    }

    // Check current permission
    if (Notification.permission === 'granted') {
      console.log('PWA: Push notifications already granted');
      return;
    }

    if (Notification.permission === 'denied') {
      console.log('PWA: Push notifications denied');
      return;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('PWA: Push notifications granted');
      // Subscribe to push notifications
      await this.subscribeToPush();
    }
  }

  async subscribeToPush() {
    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // Replace with your VAPID public key
          'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9LUhbKbVPLfzYKCrAh4u7WgPSllNqoYTBuHgoQlXYnkNd6REKjdI'
        )
      });
      
      console.log('PWA: Push subscription successful', subscription);
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
    } catch (error) {
      console.error('PWA: Push subscription failed', error);
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async sendSubscriptionToServer(subscription) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subscription)
      });
      
      console.log('PWA: Subscription sent to server');
    } catch (error) {
      console.error('PWA: Failed to send subscription to server', error);
    }
  }

  // Utility methods
  isInstalled() {
    return this.isInstalled;
  }

  isSupported() {
    return this.isSupported;
  }

  async getVersion() {
    if (!this.registration) return null;
    
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.version);
      };
      
      this.registration.active.postMessage(
        { type: 'GET_VERSION' }, 
        [messageChannel.port2]
      );
    });
  }
}

// Create global instance
const pwaService = new PWAService();

export default pwaService;