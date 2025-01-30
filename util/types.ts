export interface User {
  addresses: any[];
  chatRooms: any[];
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  reservationLists: any[]; 
  reservations: any[];
  role: Role;
  roleId: number;
  status: string; 
  storeId: number | null;
  ts: string;
  userId: number;
  whenAdded: string | null; 
  whoAdded: string | null;
  whoUpdated: string | null;
}

export interface Role {
  name: string;
  roleId: number;
  ts: string; 
  whenAdded: string | null;
  whoAdded: string | null;
  whoUpdated: string | null;
}
