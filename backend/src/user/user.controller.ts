import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
  } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto,AddressDto } from './dto/user.dto';

@Controller('/user')
export class UserController {
        constructor(private readonly UserService: UserService){}
        @Post('/register')
        async registerUser(@Body() registerData: { user: UserDto, address: AddressDto }) {
            try{
                const response = await this.UserService.createUser(registerData.user, registerData.address);
                return{
                    response,
                    message: 'ลงทะเบียนผู้ใช้สำเร็จ',
                }
            }catch(error){
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
            return {
                response,
            };
            } catch (error) {
                throw new BadRequestException(error.message);
            }
        }
}

