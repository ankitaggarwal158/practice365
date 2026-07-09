export interface MessageThread {
  id: string;
  firmId: string;
  matterId: {
    id: string;
    title: string;
    matterNumber: string;
  };
  clientId: {
    id: string;
    firstName: string;
    lastName: string;
    companyName: string;
    clientType: string;
  };
  lastMessageId: {
    id: string;
    message: string;
    senderType: "FIRM_USER" | "CLIENT";
    createdAt: string;
  } | null;
  lastMessageAt: string | null;
  lastMessageBy: string | null;
  unreadClientCount: number;
  unreadFirmCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MatterMessage {
  id: string;
  threadId: string;
  firmId: string;
  matterId: string;
  senderType: "FIRM_USER" | "CLIENT";
  senderId: string;
  message: string;
  deliveryStatus: "DELIVERED" | "READ";
  deliveredAt: string | null;
  readAt: string | null;
  hasAttachments: boolean;
  createdAt: string;
}
