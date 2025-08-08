// import { Resend } from 'resend'
   
// if (!process.env.RESEND_API_KEY) {
//   throw new Error('RESEND_API_KEY is not set')
// }
   
// export const resend = new Resend(process.env.RESEND_API_KEY)

// Mock resend for now
export const resend = {
  emails: {
    send: async (options: any) => {
      console.log('Mock resend send:', options)
      return { data: { id: 'mock-id' }, error: null }
    }
  }
}