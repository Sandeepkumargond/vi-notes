import mongoose, { Document } from 'mongoose';
interface IUserDocument extends UserRequest, Document {
}
interface UserRequest {
    email: string;
    passwordHash: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const UserModel: mongoose.Model<IUserDocument, {}, {}, {}, mongoose.Document<unknown, {}, IUserDocument> & IUserDocument & {
    _id: mongoose.Types.ObjectId;
}, any>;
export {};
//# sourceMappingURL=User.d.ts.map