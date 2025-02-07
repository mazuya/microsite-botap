import {
    BadRequestException,
    Body,
    Controller,
    Param,
    Get,
    Post,
    Patch,
    UseGuards,
    Req
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto, AddressDto } from './dto/user.dto';
import { AuthGuard } from '@nestjs/passport';

interface RequestWithUser extends Request {
    user: {
        userId: string;
        lineId: string;
    }
}

@Controller('/user')
export class UserController {
    constructor(private readonly UserService: UserService){}

    // Public routes
    @Post('/register')
    async registerUser(@Body() registerData: { user: UserDto, address: AddressDto }) {
        try {
            const response = await this.UserService.createUser(registerData.user, registerData.address);
            return {
                response,
                message: 'ลงทะเบียนผู้ใช้สำเร็จ',
            }
        } catch(error) {
            throw new BadRequestException(error.message);
        }
    }

    @Post('/login')
    async logInUser(
        @Body() postData: { lineId: string; lineProfilePic?: string },
    ) {
        const { lineId, lineProfilePic } = postData;

        if (!lineId) {
            throw new BadRequestException('กรุณาระบุ Line ID');
        }

        try {
            const response = await this.UserService.loginWithLineId(
                lineId,
                lineProfilePic,
            );
            return response;  // Already includes token and user data
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // Protected routes
    @UseGuards(AuthGuard('jwt'))
    @Get('/profile')
    async getUserProfile(@Req() req: RequestWithUser) {
        return this.UserService.getUserProfile(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/profile/address')
    async addAddress(
        @Req() req: RequestWithUser,
        @Body() addressData: Omit<AddressDto, 'userId'>
    ) {
        return this.UserService.addUserAddress(req.user.userId, addressData);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('/address/update')
    async updateAddress(
        @Req() req: RequestWithUser,
        @Body() updateData: {
            addressId: string,
            address: Partial<Omit<AddressDto, 'userId'>>
        }
    ) {
        return this.UserService.updateAddress(
            req.user.userId, 
            updateData.addressId, 
            updateData.address
        );
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('/address/primary')
    async setPrimaryAddress(
        @Req() req: RequestWithUser,
        @Body() data: { addressId: string }
    ) {
        return this.UserService.setPrimaryAddress(req.user.userId, data.addressId);
    }
}