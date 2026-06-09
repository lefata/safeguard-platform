// src/lib/storage.ts
import { put, del, list } from '@vercel/blob'
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
//import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'

const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'
const algorithm = 'aes-256-gcm'

function encrypt(buffer: Buffer): Buffer {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionKey.padEnd(32).slice(0, 32)), iv)
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted])
}

function decrypt(encryptedBuffer: Buffer): Buffer {
  const iv = encryptedBuffer.subarray(0, 16)
  const authTag = encryptedBuffer.subarray(16, 32)
  const encrypted = encryptedBuffer.subarray(32)
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(encryptionKey.padEnd(32).slice(0, 32)), iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()])
}

// Vercel Blob storage (primary)
export async function uploadToBlob(file: File, path: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const encryptedBuffer = encrypt(buffer)
  
  const blob = await put(path, encryptedBuffer, {
    access: 'public',
    contentType: file.type,
  })
  
  return blob.url
}

export async function deleteFromBlob(url: string): Promise<void> {
  await del(url)
}

// S3 Compatible storage (alternative)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
})

export async function uploadToS3(file: File, key: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const encryptedBuffer = encrypt(buffer)
  
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET || 'safeguard-uploads',
    Key: key,
    Body: encryptedBuffer,
    ContentType: file.type,
    ServerSideEncryption: 'AES256',
  }))

  return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`
}

//export async function getSignedS3Url(key: string, expiresIn: number = 3600): Promise<string> {
//  const command = new GetObjectCommand({
//    Bucket: process.env.S3_BUCKET || 'safeguard-uploads',
//    Key: key,
//  })
  
//  return getSignedUrl(s3Client, command, { expiresIn })
//}

export async function deleteFromS3(key: string): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET || 'safeguard-uploads',
    Key: key,
  }))
}

// Unified upload function
export async function uploadFile(file: File, path: string): Promise<string> {
  const storageProvider = process.env.STORAGE_PROVIDER || 'vercel-blob'
  
  if (storageProvider === 's3') {
    return uploadToS3(file, path)
  }
  
  return uploadToBlob(file, path)
}
