import { prisma } from '@/utils/db';
import { PasswordService } from './password.service';
import type { UserInput } from '@/utils/validators/user.validator';

export class UserService {
  static async createUser(data: UserInput) {
    const hashedPassword = await PasswordService.hash(data.password);
    
    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        roles: ['USER'],
      }
    });
  }

  static async updatePassword(userId: string, newPassword: string) {
    const hashedPassword = await PasswordService.hash(newPassword);
    
    return prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date()
      }
    });
  }

  static async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) return false;
    return PasswordService.compare(password, user.password);
  }
} 