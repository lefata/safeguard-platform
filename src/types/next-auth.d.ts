// src/types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    tenantId?: string;
    role?: string;
    mfaEnabled?: boolean;
    mfaVerified?: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      tenantId: string;
      mfaEnabled: boolean;
      mfaVerified: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    tenantId: string;
    mfaEnabled: boolean;
    mfaVerified?: boolean;
  }
}
