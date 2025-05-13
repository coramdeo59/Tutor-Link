export interface AddressResponseDto {
  id: number;
  userId: number | null;
  cityId: number | null;
  state: string | null;
  city: string | null;
  phoneNumber: string | null;
}
