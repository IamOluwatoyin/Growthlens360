import {
  Bell,
  CheckCheck,
  CircleAlert,
  FileText,
  LoaderCircle,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteNotification,
  loadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type GrowthLensNotification,
} from "../services/notifications";

function formatNotificationTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  const difference = now.getTime() - date.getTime();

  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(difference / 3600000);
  const days = Math.floor(difference / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function NotificationIcon({
  type,
}: {
  type: GrowthLensNotification["notification_type"];
}) {
  if (type === "participant_completed") {
    return <Users size={18} />;
  }

  if (type === "report_ready") {
    return <FileText size={18} />;
  }

  return <CircleAlert size={18} />;
}

export function NotificationMenu() {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [notifications, setNotifications] = useState<
    GrowthLensNotification[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [menuError, setMenuError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getNotifications = async () => {
      try {
        const savedNotifications = await loadNotifications();

        if (isMounted) {
          setNotifications(savedNotifications);
        }
      } catch (error) {
        if (isMounted) {
          setMenuError(
            error instanceof Error
              ? error.message
              : "Unable to load notifications.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void getNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const closeWhenClickingOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      closeWhenClickingOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        closeWhenClickingOutside,
      );
    };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  const openNotification = async (
    notification: GrowthLensNotification,
  ) => {
    setMenuError(null);

    try {
      if (!notification.is_read) {
        await markNotificationAsRead(notification.id);

        setNotifications((currentNotifications) =>
          currentNotifications.map((currentNotification) =>
            currentNotification.id === notification.id
              ? {
                  ...currentNotification,
                  is_read: true,
                  read_at: new Date().toISOString(),
                }
              : currentNotification,
          ),
        );
      }

      setIsOpen(false);

      if (notification.destination_path) {
        navigate(notification.destination_path);
      }
    } catch (error) {
      setMenuError(
        error instanceof Error
          ? error.message
          : "Unable to open this notification.",
      );
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;

    setIsMarkingAll(true);
    setMenuError(null);

    try {
      await markAllNotificationsAsRead();

      const readAt = new Date().toISOString();

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          is_read: true,
          read_at: notification.read_at ?? readAt,
        })),
      );
    } catch (error) {
      setMenuError(
        error instanceof Error
          ? error.message
          : "Unable to mark notifications as read.",
      );
    } finally {
      setIsMarkingAll(false);
    }
  };

  const removeNotification = async (
    event: React.MouseEvent<HTMLButtonElement>,
    notificationId: string,
  ) => {
    event.stopPropagation();

    setDeletingId(notificationId);
    setMenuError(null);

    try {
      await deleteNotification(notificationId);

      setNotifications((currentNotifications) =>
        currentNotifications.filter(
          (notification) =>
            notification.id !== notificationId,
        ),
      );
    } catch (error) {
      setMenuError(
        error instanceof Error
          ? error.message
          : "Unable to delete this notification.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe6f1] bg-white text-[#52617e] transition hover:bg-[#eef5ff] hover:text-[#1379f4]"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Open notifications"
        aria-expanded={isOpen}
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#ff5d49] px-1 text-[10px] font-black text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-[390px] overflow-hidden rounded-2xl border border-[#dfe6f1] bg-white shadow-[0_22px_60px_rgba(7,20,63,.18)]">
          <div className="flex items-center justify-between border-b border-[#e4e9f2] px-5 py-4">
            <div>
              <h2 className="font-extrabold text-[#07143f]">
                Notifications
              </h2>

              <p className="mt-1 text-xs text-[#66729b]">
                {unreadCount === 0
                  ? "You’re all caught up"
                  : `${unreadCount} unread notification${
                      unreadCount === 1 ? "" : "s"
                    }`}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#1379f4] hover:bg-[#eef5ff] disabled:opacity-50"
                  onClick={() => void markAllAsRead()}
                  disabled={isMarkingAll}
                  aria-label="Mark all notifications as read"
                  title="Mark all as read"
                >
                  {isMarkingAll ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <CheckCheck size={18} />
                  )}
                </button>
              )}

              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#66729b] hover:bg-[#f2f4f8]"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {menuError && (
            <p
              className="mx-4 mt-4 rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-semibold text-[#b42318]"
              role="alert"
            >
              {menuError}
            </p>
          )}

          <div className="max-h-[430px] overflow-y-auto">
            {isLoading ? (
              <div className="flex min-h-44 items-center justify-center">
                <LoaderCircle
                  size={28}
                  className="animate-spin text-[#1379f4]"
                />
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Bell
                  size={34}
                  className="mx-auto text-[#a3afc7]"
                />

                <h3 className="mt-4 font-extrabold text-[#07143f]">
                  No notifications yet
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#66729b]">
                  Assessment updates and action reminders will appear
                  here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group flex cursor-pointer gap-3 border-b border-[#edf0f5] px-4 py-4 transition last:border-b-0 hover:bg-[#f8faff] ${
                    notification.is_read
                      ? "bg-white"
                      : "bg-[#eef5ff]"
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    void openNotification(notification)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      void openNotification(notification);
                    }
                  }}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      notification.notification_type ===
                      "participant_completed"
                        ? "bg-[#eaf5ff] text-[#1379f4]"
                        : notification.notification_type ===
                            "report_ready"
                          ? "bg-[#e8f8ef] text-[#10a968]"
                          : "bg-[#fff0ed] text-[#ff5d49]"
                    }`}
                  >
                    <NotificationIcon
                      type={notification.notification_type}
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <h3 className="flex-1 text-sm font-extrabold leading-5 text-[#07143f]">
                        {notification.title}
                      </h3>

                      {!notification.is_read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#1379f4]" />
                      )}
                    </div>

                    <p className="mt-1 text-sm leading-5 text-[#66729b]">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-xs font-semibold text-[#8a95ad]">
                      {formatNotificationTime(
                        notification.created_at,
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8a95ad] opacity-100 transition hover:bg-[#fff0ed] hover:text-[#b42318] sm:opacity-0 sm:group-hover:opacity-100"
                    onClick={(event) =>
                      void removeNotification(
                        event,
                        notification.id,
                      )
                    }
                    disabled={deletingId === notification.id}
                    aria-label="Delete notification"
                  >
                    {deletingId === notification.id ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}