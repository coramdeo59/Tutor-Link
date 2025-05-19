import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { Role } from '../enums/roles-type-enum';

@Injectable()
export class RoleTransformerPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // If input is not an object, return as is
    if (!value || typeof value !== 'object') {
      return value;
    }

    // Clone the value to avoid modifying the original
    const transformedValue = { ...value };

    // If role property exists and is a string, transform it to lowercase
    if (transformedValue.role && typeof transformedValue.role === 'string') {
      // Transform role to lowercase if it's a string representation of a Role enum value
      const uppercaseRole = transformedValue.role.toUpperCase();
      
      // Map from uppercase role name to lowercase enum value
      if (uppercaseRole === 'ADMIN') {
        transformedValue.role = Role.ADMIN;
      } else if (uppercaseRole === 'PARENT') {
        transformedValue.role = Role.PARENT;
      } else if (uppercaseRole === 'TUTOR') {
        transformedValue.role = Role.TUTOR;
      } else if (uppercaseRole === 'CHILD') {
        transformedValue.role = Role.CHILD;
      }
    }

    return transformedValue;
  }
} 