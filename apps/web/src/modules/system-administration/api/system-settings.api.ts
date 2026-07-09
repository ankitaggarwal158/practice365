import { API_BASE_URL } from "../../../services/http-client";
import { SystemSettings, FeatureFlag, SystemAnnouncement, SystemHealth } from "../types";

function getHeaders() {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  const text = await response.text();
  let json: any = {};
  try {
    json = JSON.parse(text);
  } catch (err) {
    // If response was not JSON, wrap error
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${text || response.statusText}`);
    }
  }

  if (!response.ok) {
    throw new Error(json.message || `HTTP Error ${response.status}`);
  }

  return json.data;
}

export const systemSettingsApi = {
  getSystemSettings(): Promise<SystemSettings> {
    return request<SystemSettings>("/system/settings");
  },

  updateSystemSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    return request<SystemSettings>("/system/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  listFeatureFlags(): Promise<FeatureFlag[]> {
    return request<FeatureFlag[]>("/system/feature-flags");
  },

  updateFeatureFlag(id: string, enabled: boolean): Promise<FeatureFlag> {
    return request<FeatureFlag>(`/system/feature-flags/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    });
  },

  listAnnouncements(): Promise<SystemAnnouncement[]> {
    return request<SystemAnnouncement[]>("/system/announcements");
  },

  listActiveAnnouncements(): Promise<SystemAnnouncement[]> {
    return request<SystemAnnouncement[]>("/system/announcements/active");
  },

  createAnnouncement(data: any): Promise<SystemAnnouncement> {
    return request<SystemAnnouncement>("/system/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateAnnouncement(id: string, data: any): Promise<SystemAnnouncement> {
    return request<SystemAnnouncement>(`/system/announcements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteAnnouncement(id: string): Promise<SystemAnnouncement> {
    return request<SystemAnnouncement>(`/system/announcements/${id}`, {
      method: "DELETE",
    });
  },

  getSystemHealth(): Promise<SystemHealth> {
    return request<SystemHealth>("/system/health");
  },
};

export default systemSettingsApi;
