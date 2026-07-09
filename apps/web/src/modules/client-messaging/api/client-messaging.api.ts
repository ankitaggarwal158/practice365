import { API_BASE_URL } from "../../../services/http-client";
import { PortalApiClient } from "../../client-portal/api/portal.api";
import { MessageThread, MatterMessage } from "../types";

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
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${text || response.statusText}`);
    }
  }

  if (!response.ok) {
    throw new Error(json.message || `HTTP Error ${response.status}`);
  }

  return json.data;
}

// ─── Firm Staff API ────────────────────────────────────────────────

export const clientMessagingApi = {
  listThreads(page = 1, limit = 25): Promise<{ docs: MessageThread[]; total: number; pages: number }> {
    return request<any>(`/message-threads?page=${page}&limit=${limit}`).then((data) => ({
      docs: data,
      total: data.length, // Fallback if pagination details not explicitly returned
      pages: 1,
    }));
  },

  getThreadDetails(matterId: string): Promise<MessageThread> {
    return request<MessageThread>(`/message-threads/${matterId}`);
  },

  listMessages(matterId: string, page = 1, limit = 50): Promise<MatterMessage[]> {
    return request<MatterMessage[]>(`/message-threads/${matterId}/messages?page=${page}&limit=${limit}`);
  },

  sendMessage(matterId: string, message: string): Promise<MatterMessage> {
    return request<MatterMessage>(`/message-threads/${matterId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },

  uploadAttachment(matterId: string, file: File): Promise<MatterMessage> {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("accessToken");
    return fetch(`${API_BASE_URL}/message-threads/${matterId}/attachments`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success === false) {
          throw new Error(json.message || "Failed to upload attachment");
        }
        return json.data;
      });
  },

  markAsRead(messageId: string): Promise<void> {
    return request<void>(`/messages/${messageId}/read`, {
      method: "PATCH",
    });
  },
};

// ─── Portal Client API ─────────────────────────────────────────────

export const portalMessagingApi = {
  listThreads(): Promise<MessageThread[]> {
    return PortalApiClient.get<MessageThread[]>("/portal/message-threads");
  },

  getThreadDetails(matterId: string): Promise<MessageThread> {
    return PortalApiClient.get<MessageThread>(`/portal/message-threads/${matterId}`);
  },

  listMessages(matterId: string): Promise<MatterMessage[]> {
    return PortalApiClient.get<MatterMessage[]>(`/portal/message-threads/${matterId}/messages`);
  },

  sendMessage(matterId: string, message: string): Promise<MatterMessage> {
    return PortalApiClient.post<MatterMessage>(`/portal/message-threads/${matterId}/messages`, { message });
  },

  uploadAttachment(matterId: string, file: File): Promise<MatterMessage> {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("portalAccessToken");
    return fetch(`${API_BASE_URL}/portal/message-threads/${matterId}/attachments`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success === false) {
          throw new Error(json.message || "Failed to upload attachment");
        }
        return json.data;
      });
  },

  markAsRead(messageId: string): Promise<void> {
    return PortalApiClient.patch<void>(`/portal/messages/${messageId}/read`);
  },
};
