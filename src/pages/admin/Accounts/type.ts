export type AccountDataType = {
    id: number;
    userId: number;
    college: string;
    program: string;
    yearLevel: string;
    payor: string;
    studentId: string;
    email: string;
    firstName: string;
    middleName: string;
    lastName: string;
    status: string;
    userType: string;
    designation?: string;
    idNumber?: string;
    hasMatchingRecord?: number;
}

export type AdminAccountDataType = {
    id: number;
    userId: number;
    email: string;
    accessLevel: number;
    status: number;
    department?: number;
}