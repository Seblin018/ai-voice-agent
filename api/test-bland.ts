export default async function handler(req: any, res: any) {
  return res.status(200).json({
    hasBlandKey: !!process.env.BLAND_API_KEY,
    keyPreview: process.env.BLAND_API_KEY ? 
      process.env.BLAND_API_KEY.substring(0, 8) + '...' : 
      'NOT SET'
  });
}
