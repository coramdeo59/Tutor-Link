import { Controller, Post, Param, ParseIntPipe } from '@nestjs/common';
import { ParentService } from './parent.service';
import { AuthType } from 'src/auth/authentication/enums/auth-type.enum';
import { Auth } from 'src/auth/authentication/decorators/auth-decorator';

@Auth(AuthType.Bearer) // Requires authentication for parent operations
@Controller('parents')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  /**
   * Ensure a parent record exists for a user
   * This helps fix data integrity issues where parent users existed without parent records
   */
  @Post('ensure-record/:userId')
  async ensureParentRecord(@Param('userId', ParseIntPipe) userId: number) {
    const recordCreated = await this.parentService.createParentRecord(userId);
    return { success: recordCreated };
  }
}
