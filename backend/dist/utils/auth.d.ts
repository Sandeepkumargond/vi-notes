export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
export declare const generateToken: (userId: string, email: string) => string;
export declare const validateEmail: (email: string) => boolean;
export declare const wordCount: (text: string) => number;
export declare const characterCount: (text: string) => number;
//# sourceMappingURL=auth.d.ts.map