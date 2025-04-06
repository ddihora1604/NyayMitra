"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  Check, 
  Info, 
  Upload, 
  MessageSquare, 
  Map, 
  Users, 
  Camera, 
  FileText, 
  Newspaper,
  X,
  Trash2,
  BellOff,
  Navigation,
  UserCheck,
  AlertTriangle,
  Mic
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Remove direct document manipulation that causes SSR errors
// Define the styles as a string to be used in useEffect
const notificationStyles = `
  @keyframes highlightNew {
    0% { background-color: rgba(251, 191, 36, 0.4); }
    50% { background-color: rgba(251, 191, 36, 0.2); }
    100% { background-color: rgba(251, 191, 36, 0.1); }
  }
  
  .animate-highlight {
    animation: highlightNew 2s ease-out;
  }
  
  .scrollbar-thin {
    scrollbar-width: thin;
  }
  
  .scrollbar-thumb-amber-200::-webkit-scrollbar-thumb {
    background-color: rgb(253, 230, 138);
    border-radius: 9999px;
  }
  
  .scrollbar-track-amber-50::-webkit-scrollbar-track {
    background-color: rgb(255, 251, 235);
  }
  
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
`;

// Types for notifications
type NotificationType = 'upload' | 'navigation' | 'chatbot' | 'connection' | 'camera' | 'recommendation' | 'legal' | 'news';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  immediate: boolean;
  action?: string;
}

// Sample notification data
const sampleImmediateNotifications: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [
  {
    title: "New Document Uploaded",
    message: "Your case document 'Evidence-A1.pdf' has been successfully uploaded.",
    type: "upload",
    immediate: true,
    action: "View Document"
  },
  {
    title: "New Chat Response",
    message: "The legal assistant has responded to your question about property rights.",
    type: "chatbot",
    immediate: true,
    action: "View Chat"
  },
  {
    title: "Connection Request",
    message: "Attorney Priya Sharma wants to connect with you regarding your property case.",
    type: "connection",
    immediate: true,
    action: "Accept Request"
  },
  {
    title: "Photo Captured",
    message: "Your property boundary photo has been captured and saved to your case file.",
    type: "camera",
    immediate: true,
    action: "View Photo"
  }
];

// Sample data for informational notifications
const sampleInfoNotifications: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [
  {
    title: "Case Update",
    message: "Your hearing date has been scheduled for June 15, 2023.",
    type: "navigation",
    immediate: false
  },
  {
    title: "Document Recommendation",
    message: "We recommend uploading your property papers for better case analysis.",
    type: "recommendation",
    immediate: false,
    action: "Upload Now"
  }
];

// Sample system notifications
const systemNotifications: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [
  {
    title: "Legal System Update",
    message: "Recent changes to property law may affect your case. Tap to learn more.",
    type: "legal",
    immediate: true,
    action: "Learn More"
  },
  {
    title: "New Feature Available",
    message: "You can now schedule video consultations with attorneys directly from the app.",
    type: "news", 
    immediate: true,
    action: "Try Now"
  }
];

// Helper function to generate notifications
const generateNotification = (template: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification => ({
  ...template,
  id: Math.random().toString(36).substring(2, 11),
  timestamp: new Date(),
  read: false
});

// Icon mapper for notification types
const notificationIcons: Record<NotificationType, React.ReactNode> = {
  upload: <Upload size={16} className="text-blue-500" />,
  navigation: <Map size={16} className="text-amber-500" />,
  chatbot: <MessageSquare size={16} className="text-green-500" />,
  connection: <Users size={16} className="text-purple-500" />,
  camera: <Camera size={16} className="text-red-500" />,
  recommendation: <FileText size={16} className="text-teal-500" />,
  legal: <Info size={16} className="text-amber-500" />,
  news: <Newspaper size={16} className="text-amber-700" />
};

// Add this function to simulate user actions in demo mode
// For production, this would be replaced with event-based triggers
const simulateUserActions = () => {
  // In a real app, we would have a proper event system to trigger these notifications
  // This is just a simulation for demo purposes
  const actions = [
    {
      name: 'documentUpload',
      chance: 0.3,
      notification: {
        type: 'upload' as const,
        title: 'Document Uploaded',
        message: 'Your legal document "Income Certificate.pdf" has been successfully uploaded.',
        immediate: true
      }
    },
    {
      name: 'chatbotResponse',
      chance: 0.25,
      notification: {
        type: 'chatbot' as const,
        title: 'Chatbot Response',
        message: 'The legal assistant has responded to your query about property rights.',
        immediate: true
      }
    },
    {
      name: 'connectionRequest',
      chance: 0.15,
      notification: {
        type: 'connection' as const,
        title: 'New Connection Request',
        message: 'Lawyer Rajiv Malhotra wants to connect with you regarding your case.',
        immediate: true
      }
    },
    {
      name: 'photoCapture',
      chance: 0.2,
      notification: {
        type: 'camera' as const,
        title: 'Photo Captured',
        message: 'Your document photo has been processed and saved to your case file.',
        immediate: true
      }
    }
  ];

  // Randomly simulate an action based on chance
  const randomValue = Math.random();
  let accumulatedChance = 0;
  
  for (const action of actions) {
    accumulatedChance += action.chance;
    if (randomValue <= accumulatedChance) {
      return generateNotification(action.notification);
    }
  }
  
  return null;
};

// Helper function to get notification icon based on type
const getNotificationIcon = (type: NotificationType) => {
  switch(type) {
    case 'upload':
      return <Upload size={16} className="text-blue-500" />;
    case 'navigation':
      return <Navigation size={16} className="text-amber-500" />;
    case 'chatbot':
      return <MessageSquare size={16} className="text-green-500" />;
    case 'connection':
      return <UserCheck size={16} className="text-purple-500" />;
    case 'camera':
      return <Camera size={16} className="text-red-500" />;
    case 'recommendation':
      return <Info size={16} className="text-teal-500" />;
    case 'legal':
      return <AlertTriangle size={16} className="text-amber-500" />;
    case 'news':
      return <Newspaper size={16} className="text-amber-800" />;
    default:
      return <Bell size={16} className="text-gray-500" />;
  }
};

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Add styles in useEffect to ensure it only runs on client side
  useEffect(() => {
    // Create and append style element only on client side
    const styles = document.createElement('style');
    styles.innerHTML = notificationStyles;
    document.head.appendChild(styles);
    
    // Clean up function to remove styles when component unmounts
    return () => {
      document.head.removeChild(styles);
    };
  }, []);
  
  // Helper function to add a new notification with animation
  const addNotificationWithAnimation = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setHasNewNotification(true);
    
    // Toast notifications disabled per requirement
    // if (!isOpen && notification.immediate) {
    //   showToastNotification(notification);
    // }
    
    // Reset the animation flag after animation completes
    setTimeout(() => {
      setHasNewNotification(false);
    }, 1000);
  };
  
  // Function to show a toast notification - disabled
  const showToastNotification = (notification: Notification) => {
    // Disabled per requirement - no popups in between the frontend
    return;
  };
  
  // Helper to get icon color based on notification type - still used in the main panel
  const getIconColor = (type: NotificationType): string => {
    const colorMap: Record<NotificationType, string> = {
      upload: '#3b82f6', // blue
      navigation: '#f59e0b', // amber
      chatbot: '#22c55e', // green
      connection: '#8b5cf6', // purple
      camera: '#ef4444', // red
      recommendation: '#14b8a6', // teal
      legal: '#f59e0b', // amber
      news: '#a16207' // amber dark
    };
    
    return colorMap[type] || '#6b7280'; // gray default
  };
  
  // Effect to handle click outside to close the panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Effect to add immediate notifications when actions happen
  useEffect(() => {
    // Simulate receiving an immediate notification on mount
    setTimeout(() => {
      const randomImmediate = sampleImmediateNotifications[
        Math.floor(Math.random() * sampleImmediateNotifications.length)
      ];
      
      const newNotification = generateNotification(randomImmediate);
      addNotificationWithAnimation(newNotification);
    }, 2000); // Wait 2 seconds before showing the first notification
    
    // Simulate occasional immediate notifications from user actions (demo purpose only)
    const actionInterval = setInterval(() => {
      const actionNotification = simulateUserActions();
      if (actionNotification) {
        addNotificationWithAnimation(actionNotification);
      }
    }, 45000); // Every 45 seconds for demo purposes
    
    // Occasionally add system notifications
    const systemInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance
        const randomSystem = systemNotifications[
          Math.floor(Math.random() * systemNotifications.length)
        ];
        
        const systemNotification = generateNotification(randomSystem);
        addNotificationWithAnimation(systemNotification);
      }
    }, 90000); // Every 1.5 minutes
    
    // Cleanup function
    return () => {
      clearInterval(actionInterval);
      clearInterval(systemInterval);
    };
  }, []);

  // Modified: For testing/demo, make informational notifications appear more frequently
  useEffect(() => {
    // Use a shorter interval for demo purposes
    // In production, this would be 2-3 minutes as specified
    const demoInterval = 30000; // 30 seconds for demo
    const prodInterval = Math.floor(Math.random() * (180000 - 120000 + 1)) + 120000; // 2-3 minutes
    
    // Use the demo interval for now
    const interval = setInterval(() => {
      const randomInfo = sampleInfoNotifications[
        Math.floor(Math.random() * sampleInfoNotifications.length)
      ];
      
      const newNotification = generateNotification(randomInfo);
      addNotificationWithAnimation(newNotification);
    }, demoInterval);
    
    // Cleanup function
    return () => clearInterval(interval);
  }, []);

  // Update unread count whenever notifications change
  useEffect(() => {
    // We now show total number of notifications, not just unread ones
    setUnreadCount(notifications.length);
  }, [notifications]);

  // Handler functions
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleRemove = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 minute ago';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  // Function to toggle the notification panel
  const togglePanel = () => {
    setIsOpen(!isOpen);
    // Don't mark all as read when opening - user should be able to see which ones are unread
  };

  // Function to render the notification button with bell icon
  const renderNotificationButton = () => {
    // Check if there are any unread notifications
    const hasUnread = notifications.some(n => !n.read);
    
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 border-amber-200 text-amber-600"
        >
          <Mic size={20} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="relative h-10 w-10 border-amber-200"
          onClick={togglePanel}
        >
          <Bell 
            size={20} 
            className={hasUnread ? "animate-pulse text-amber-500" : notifications.length > 0 ? "text-amber-500" : ""} 
          />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-h-5 min-w-5 flex items-center justify-center px-1">
              {notifications.length}
            </span>
          )}
        </Button>
      </div>
    );
  };

  // Function to handle notification actions
  const handleAction = (notification: Notification) => {
    console.log(`Action triggered for notification: ${notification.title}`);
    // Mark as read when action is taken
    handleMarkAsRead(notification.id);
    
    // Here you would typically perform the action associated with the notification
    // For example, navigating to a specific page or opening a modal
    if (notification.type === 'chatbot') {
      // Navigate to chat
      console.log('Navigate to chat');
    } else if (notification.type === 'upload') {
      // Open document
      console.log('Open document');
    } else if (notification.type === 'connection') {
      // Open connection request
      console.log('Open connection request');
    }
  };

  return (
    <>
      {renderNotificationButton()}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 top-16 w-80 bg-white border border-amber-100 shadow-lg rounded-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-5 duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-amber-100 bg-amber-50">
            <h3 className="font-medium text-amber-800">Notifications</h3>
            <div className="flex space-x-1">
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-amber-600 hover:text-amber-800 px-2 py-1 rounded hover:bg-amber-100 transition-colors"
              >
                Mark all as read
              </button>
              <button
                onClick={handleClearAll}
                className="text-xs text-amber-600 hover:text-amber-800 px-2 py-1 rounded hover:bg-amber-100 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-amber-50">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <BellOff size={24} className="mx-auto mb-2 text-gray-400" />
                <p>No notifications</p>
              </div>
            ) : (
              <ul className="divide-y divide-amber-100">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={cn(
                      "p-3 hover:bg-amber-50 transition-colors",
                      notification.read ? "bg-white" : "bg-amber-50/50",
                      hasNewNotification && notification.id === notifications[0].id 
                        ? "animate-highlight" : ""
                    )}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-1 text-amber-500">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className={cn(
                            "text-sm font-medium mb-1 text-amber-900",
                            !notification.read && "font-semibold"
                          )}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2 flex-shrink-0">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          {notification.action && (
                            <button 
                              className="text-xs font-medium text-amber-600 hover:text-amber-800"
                              onClick={() => handleAction(notification)}
                            >
                              {notification.action}
                            </button>
                          )}
                          <div className="flex space-x-1 ml-auto">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-xs text-gray-500 hover:text-amber-600"
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => handleRemove(notification.id)}
                              className="text-xs text-gray-500 hover:text-amber-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
} 