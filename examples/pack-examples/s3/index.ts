// Minimal S3 put/get sanity check (AWS SDK v3)
// Env: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BUCKET
// Run: npx tsx examples/pack-examples/s3/index.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

async function main(){
  const region = process.env.AWS_REGION || 'us-east-1';
  const bucket = process.env.BUCKET || 'my-bucket';
  const client = new S3Client({ region });
  const key = 'hello.txt';
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: new TextEncoder().encode('hello') }));
  const out = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  console.log(out.$metadata.httpStatusCode === 200 ? 'ok' : 'ng');
}

main().catch((e)=>{ console.error(e); process.exit(1); });
