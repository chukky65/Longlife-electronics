export interface SavedAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  isDefault: boolean;
}

const storageKey = (userId: string) => `longlife_addresses_${userId}`;

export const getSavedAddresses = (userId: string) => {
  try {
    const saved = localStorage.getItem(storageKey(userId));
    return saved ? (JSON.parse(saved) as SavedAddress[]) : [];
  } catch {
    return [];
  }
};

export const saveSavedAddresses = (userId: string, addresses: SavedAddress[]) => {
  localStorage.setItem(storageKey(userId), JSON.stringify(addresses));
};

export const getDefaultAddress = (userId: string) =>
  getSavedAddresses(userId).find((address) => address.isDefault) || null;
