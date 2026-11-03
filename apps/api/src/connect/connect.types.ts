export type ConnectUser = {
  userId: string;
  alias: string;
  socketId: string;
};

export type ConnectSession = {
  id: string;
  userA: ConnectUser;
  userB: ConnectUser;
  createdAt: number;
};

export type QueueEntry = ConnectUser & { joinedAt: number };
