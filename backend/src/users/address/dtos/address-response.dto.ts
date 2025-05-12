export interface AddressResponseDto {
  id: number;
  userId?: number | null;
  location: string;
  state?: string | null;
  city?: string | null;
  phoneNumber?: string | null;
  street?: string | null;
}
