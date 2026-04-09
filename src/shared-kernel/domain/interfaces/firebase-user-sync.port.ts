export interface SyncFirebaseUserInput {
  firebaseUid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  locationLabel?: string;
  locationLatitude?: number;
  locationLongitude?: number;
}

export interface SyncedUserIdentity {
  id: string;
}

export const FIREBASE_USER_SYNC_PORT = Symbol('FIREBASE_USER_SYNC_PORT');

export interface IFirebaseUserSyncPort {
  execute(input: SyncFirebaseUserInput): Promise<SyncedUserIdentity>;
}
