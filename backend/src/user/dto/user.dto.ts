import { IsString,IsNotEmpty,Length,Matches,IsOptional, isNotEmpty, isString} from 'class-validator';

export class UserDto{
    @IsString()
    @IsNotEmpty({message: 'กรุณากรอกชื่อ-นามสกุล'})
    fullname: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกหมายเลขโทรศัพท์' })
    @Length(10, 10, { message: 'กรุณากรอกหมายเลขโทรศัพท์ให้ครบทั้ง 10 หลัก' })
    @Matches(/^[0-9]+$/, {message: 'กรุณากรอกเฉพาะหมายเลขโทรศัพท์'})
    phone: string;
    
    @IsString()
    lineId: string;

    @IsOptional()
    @IsString()
    lineProfilePic?: string;

    @IsString()
    @IsNotEmpty({message: 'กรุณากรอกวันกิด'})
    birthdate: string;

    @IsString()
    @IsNotEmpty({message: 'กรุณากรอกรหัสตัวแทน'})
    agentId: string;

    @IsString()
    @IsNotEmpty({message: 'กรูณากรอกรหัสผลิตภัณฑ์'})
    code: string;
}

export class AddressDto{
    @IsString()
    @IsNotEmpty({message: 'ไม่พบ userId'})
    userId: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกบ้านเลขที่' })
    house_address: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกตำบล' })
    sub_district: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกอำเภอ' })
    district: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกจังหวัด' })
    province: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกรหัสไปรษณี' })
    postal_code: string;
}
