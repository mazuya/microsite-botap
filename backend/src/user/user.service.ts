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
    
        // Generate JWT token
        const access_token = await this.authService.generateUserJwt(user);
    
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
            access_token,  // Changed from jwt to access_token for consistency
            message: 'เข้าสู่ระบบสำเร็จและข้อมูลรูปโปรไฟล์ของคุณได้รับการอัปเดต',
          };
        }
        
        this.logger.log('user logged in with lineId', lineId, ':loginWithLineId');
        return {
          user,  // Changed from spread operator to just returning user object
          access_token,  // Changed from jwt to access_token
          message: 'เข้าสู่ระบบสำเร็จ',
        };
    }

    async getUserProfile(userId: string) {
        try {
            // Get user and their addresses in a single query using include
            const userProfile = await this.prisma.user.findUnique({
                where: { 
                    userId: userId
                },
                include: {
                    addresses: {
                        orderBy: {
                            createdAt: 'desc'
                        }
                    }
                }
            });
    
            if (!userProfile) {
                this.logger.warn(
                    'ไม่พบข้อมูลผู้ใช้',
                    userId,
                    ':getUserProfile'
                );
                throw new NotFoundException('ไม่พบข้อมูลผู้ใช้');
            }
    
            this.logger.log(
                `พบข้อมูลผู้ใช้ ${userProfile.fullname}`,
                userId,
                ':getUserProfile'
            );
    
            return userProfile;
    
        } catch (error) {
            this.logger.error(
                'Failed to fetch user profile',
                error.message,
                ':getUserProfile'
            );
            throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
        }
    }
    
    // Function to add new address
    async addUserAddress(userId: string, addressData: Omit<AddressDto, 'userId'>) {
        try {
            // Find all existing addresses
            const existingAddresses = await this.prisma.address.findMany({
                where: { userId }
            });
    
            // If this is the first address, set isSelected to true
            // If not, set it to false
            const isSelected = existingAddresses.length === 0;
    
            const newAddress = await this.prisma.address.create({
                data: {
                    userId,
                    ...addressData,
                    isSelected
                }
            });
    
            return newAddress;
        } catch (error) {
            this.logger.error(
                'Failed to add user address',
                error.message,
                ':addUserAddress'
            );
            throw new InternalServerErrorException('ไม่สามารถเพิ่มที่อยู่ได้');
        }
    }
    
    // Function to update address
    async updateAddress(userId: string, addressId: string, addressData: Partial<Omit<AddressDto, 'userId'>>) {
        try {
            // First check if address belongs to user
            const existingAddress = await this.prisma.address.findFirst({
                where: {
                    AND: [
                        { addressId: addressId }, // Now using string type
                        { userId: userId }
                    ]
                }
            });

            if (!existingAddress) {
                this.logger.error(
                    'Address not found or does not belong to user',
                    `userId: ${userId}, addressId: ${addressId}`,
                    ':updateAddress'
                );
                throw new NotFoundException('ไม่พบข้อมูลที่อยู่');
            }

            const updatedAddress = await this.prisma.address.update({
                where: { addressId }, // Now using string type
                data: {
                    ...addressData,
                    updatedAt: new Date()
                }
            });

            return updatedAddress;
        } catch (error) {
            this.logger.error(
                'Failed to update address',
                error.message,
                ':updateAddress'
            );
            throw new InternalServerErrorException('ไม่สามารถอัพเดทที่อยู่ได้');
        }
    }

    // Function to set primary address
    async setPrimaryAddress(userId: string, addressId: string) { // Changed from number to string
        try {
            // First check if address belongs to user
            const existingAddress = await this.prisma.address.findFirst({
                where: {
                    AND: [
                        { addressId: addressId }, // Now using string type
                        { userId: userId }
                    ]
                }
            });

            if (!existingAddress) {
                this.logger.error(
                    'Address not found or does not belong to user',
                    `userId: ${userId}, addressId: ${addressId}`,
                    ':setPrimaryAddress'
                );
                throw new NotFoundException('ไม่พบข้อมูลที่อยู่');
            }

            await this.prisma.$transaction([
                // First, set all user's addresses to not selected
                this.prisma.address.updateMany({
                    where: { userId },
                    data: { 
                        isSelected: false,
                        updatedAt: new Date()
                    }
                }),
                // Then set the chosen address as selected
                this.prisma.address.update({
                    where: { addressId }, // Now using string type
                    data: { 
                        isSelected: true,
                        updatedAt: new Date()
                    }
                })
            ]);

            return { message: 'ตั้งค่าที่อยู่หลักเรียบร้อยแล้ว' };
        } catch (error) {
            this.logger.error(
                'Failed to set primary address',
                error.message,
                ':setPrimaryAddress'
            );
            throw new InternalServerErrorException('ไม่สามารถตั้งค่าที่อยู่หลักได้');
        }
    }
}