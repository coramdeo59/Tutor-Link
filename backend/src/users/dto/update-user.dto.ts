export class UpdateUserDto {
  FirstName?: string;
  LastName?: string;
  Email?: string;
  Password?: string;
  UserType?: 'tutor' | 'student' | 'parent';
  addressId?: number;
  Photo?: string;
  Role?: string;
}
