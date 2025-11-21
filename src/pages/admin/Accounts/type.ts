export type AccountDataType = {
    id: number;
    user_id: number;
    college: string;
    program: string;
    yearLevel: string;
    payor_name: string;
    student_id: string;
    email: string;
    firstName: string;
    middleName: string;
    lastName: string;
    status: string;
    userType: string;
    employee_type?: string;
    id_number?: string;
}

export type AdminAccountDataType = {
    id: number;
    userId: number;
    email: string;
    accessLevel: number;
    status: number;
    department?: number;
}