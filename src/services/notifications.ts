import { supabase } from "../lib/supabase";

export type NotificationType =
  | "participant_completed"
  | "report_ready"
  | "action_reminder"
  | "general";

export type GrowthLensNotification = {
  id: string;
  business_id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  destination_path: string | null;
  is_read: boolean;
  read_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export async function loadNotifications(): Promise<
  GrowthLensNotification[]
> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      "You must be logged in to view your notifications.",
    );
  }

  const { data, error } = await supabase
    .from("notifications")
    .select(`
      id,
      business_id,
      notification_type,
      title,
      message,
      destination_path,
      is_read,
      read_at,
      metadata,
      created_at
    `)
    .eq("business_id", user.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(30);

  if (error) {
    throw error;
  }

  return (data ?? []) as GrowthLensNotification[];
}

export async function getUnreadNotificationCount(): Promise<number> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return 0;
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("business_id", user.id)
    .eq("is_read", false);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", notificationId);

  if (error) {
    throw error;
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      "You must be logged in to update notifications.",
    );
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("business_id", user.id)
    .eq("is_read", false);

  if (error) {
    throw error;
  }
}

export async function deleteNotification(
  notificationId: string,
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) {
    throw error;
  }
}