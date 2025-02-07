import { PrismaService } from 'src/prisma/prisma.service';
import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    LoggerService,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import * as moment from 'moment';
import 'moment/locale/th';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { UserDto, AddressDto } from './dto/user.dto';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class UserService{
    constructor(
        private prisma: PrismaService,
        private authService: AuthService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
    ) {}
    async createUser(userData: UserDto, addressData: AddressDto){
        // Check for duplicate phone number
        const existPhoneUser = await this.prisma.user.findUnique({
            where: { phone: userData.phone },
        });
        if(existPhoneUser) {
            this.logger.error(
                'this phone has already used',
                userData.phone,
                ':createUser',
            );
            throw new ConflictException('หมายเลขโทรศัพท์นี้ถูกใช้งานแล้ว');
        }

        // Check for duplicate lineId
        const existingLineIdUser = await this.prisma.user.findUnique({
            where: { lineId: userData.lineId },
        });
    
        if (existingLineIdUser) {
            this.logger.error(
            'this LINE ID has already used',
            userData.lineId,
            ':createUser',
            );
            throw new ConflictException('Line ID นี้ถูกใช้งานแล้ว');
        }

        const existingCode = await this.prisma.code.findUnique({
            where: {code: userData.code},
        });
        if (!existingCode) {
            this.logger.error(
                'Code not found',
                userData.code,
                ':createUser'
            );
            throw new NotFoundException('ไม่พบรหัสผลิตภัณฑ์');
        }
    
        if (existingCode.gotUsed) {
            this.logger.error(
                'Code already used',
                userData.code,
                ':createUser'
            );
            throw new ConflictException('รหัสผลิตภัณฑ์นี้ถูกใช้งานแล้ว');
        }
        try {
            // Use transaction to create both user and address
            const result = await this.prisma.$transaction(async (prisma) => {
                // 1.Update code status first 
                const updatedCode = await prisma.code.update({
                    where: { codeId: existingCode.codeId },
                    data: { gotUsed: true }
                });
                
                if(!updatedCode){
                    throw new BadRequestException('เกิดข้อผิดพลาดในการอัพเดตสถานะของรหัสผลิตภัณฑ์')
                }

                // 2. Create user 
                const newUser = await prisma.user.create({
                    data: {
                        userId: userData.lineId,
                        fullname: userData.fullname,
                        phone: userData.phone,
                        birthdate: userData.birthdate,
                        lineId: userData.lineId,
                        lineProfilePic: userData.lineProfilePic,
                        agentId: userData.agentId,
                        coupon: 1,
                        collectCount: 1
                    }
                });
    
                //3. Create address using the new user's ID
                const newAddress = await prisma.address.create({
                    data: {
                        userId: newUser.userId,
                        house_address: addressData.house_address,
                        postal_code: addressData.postal_code,
                        sub_district: addressData.sub_district,
                        district: addressData.district,
                        province: addressData.province
                    }
                });
                //4. Create collect history for registration
                const newCollectHistory = await prisma.collectHistory.create({
                    data: {
                        collectType: 'register',
                        userId: userData.lineId,
                        agentId: userData.agentId,
                        codeCode: userData.code,
                        userProvince: addressData.province,
                        uploadDate: new Date()
                    }
                });

                if(!newCollectHistory){
                    throw new BadRequestException('เกิดข้อผิดพลาดในการสร้างประวัติการสะสมรหัสผลิตภัณฑ์')
                }
    
                return { user: newUser, address: newAddress };
            });
    
            this.logger.log(
                'User and address created successfully',
                result.user.userId,
                ':createUser'
            );
            
    
            return {result};
    
        } catch (error) {
            this.logger.error(
                'Failed to create user and address',
                error.message,
                ':createUser'
            );
            throw new InternalServerErrorException('ไม่สามารถสร้างข้อมูลผู้ใช้งานได้');
        }
    }

    async loginWithLineId(lineId: string, lineProfilePic?: string) {
        // Find the user by lineId
        const user = await this.prisma.user.findUnique({
          where: { lineId },
        });
    
        if (!user) {
          this.logger.error(
            'Not found user with this LINE ID',
            lineId,
            ':loginWithLineId',
          );
          throw new NotFoundException('ไม่พบผู้ใช้ที่เข้าสู่ระบบด้วย Line ID นี้');
        }
    
        const jwt = await this.authService.generateUserJwt(user);
    
        // Update lineProfilePic if it has a different value
        if (lineProfilePic && user.lineProfilePic !== lineProfilePic) {
          const updatedUser = await this.prisma.user.update({
            where: { lineId },
            data: { lineProfilePic },
          });
    
          this.logger.log(
            'this user has updated new lineProfilePic',
            lineId,
            ':loginWithLineId',
          );
    
          return {
            user: updatedUser,
            jwt,
            message: 'เข้าสู่ระบบสำเร็จและข้อมูลรูปโปรไฟล์ของคุณได้รับการอัปเดต',
          };
        }
        this.logger.log('user logged in with lineId', lineId, ':loginWithLineId');
        return {
          ...user,
          jwt,
          message: 'เข้าสู่ระบบสำเร็จ',
        };
      }
}