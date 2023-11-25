import { userRole } from 'src/common';

export interface socketMessage {
  message: string;
}

export interface socketConnection {
  userId: string;
  socketId: string;
  role: userRole;
}

export interface socketCreateRoomDto {
  key: string;
}
