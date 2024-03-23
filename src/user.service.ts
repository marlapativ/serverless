import env from './config/env'
import Email from './model/email.model'
import User from './model/user.model'
import sendGridClient from '@sendgrid/mail'

sendGridClient.setApiKey(env.getOrDefault('SENDGRID_API_KEY', ''))
const fromEmail = env.getOrDefault('SENDGRID_FROM_EMAIL', 'signup@tejamarlapati.tech')
const verifyUrl = env.getOrDefault('VERIFY_URL', 'http://tejamarlapati.tech/v1/user/verify')
const verifyEmailTemplateId = env.getOrDefault('VERIFY_EMAIL_TEMPLATE_ID', 'd-1201e8b2b4884e10a7335113d40a20aa')

export type UserAddCloudEvent = {
  userId: string
}

const getVerifyUrl = (email: string, authToken: string) => {
  return `${verifyUrl}?email=${email}&auth_token=${authToken}`
}

const handleUserAdd = async (addUser?: UserAddCloudEvent) => {
  // Validate input
  const userId = addUser?.userId
  if (!userId) {
    console.error('Missing userId')
    return
  }

  console.log('Sending verification email for user with ID: ', userId)
  const user = await User.findByPk(userId)
  if (!user) {
    console.error('User not found with id: ' + userId)
    return
  }

  if (user.email_verified) {
    console.log('User already verified')
    return
  }

  // Do not send email if already sent
  if (user.email_verification_sent_date) {
    console.log('Verification email already sent')
    return
  }

  const authToken = randomString(128)

  // Send verification email
  const result = await sendGridClient.send({
    to: user.username,
    from: fromEmail,
    subject: 'Verify your email',
    templateId: verifyEmailTemplateId,
    dynamicTemplateData: {
      subject: 'Thanks for signing up!',
      verifyUrl: getVerifyUrl(user.username, authToken)
    }
  })
  console.log('Verification email status: ', result[0].statusCode)
  if (result[0].statusCode >= 300) {
    console.error('Error sending verification email')
    return
  }
  try {
    user.email_verification_token = authToken
    user.email_verification_sent_date = new Date()
    await user.save()
    console.log('User updated with verification token')
  } catch (e) {
    console.error(`Error saving user: ${e.message}`)
  }

  // Create email record
  console.log('Creating email record')
  try {
    const email = await Email.create({
      user_id: userId,
      email_type: 'verification',
      send_date: new Date()
    })
    console.log('Email record created: ', email.id)
  } catch (e) {
    console.error(`Error creating email record: ${e.message}`)
  }

  return true
}

const randomString = (length: number): string => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  var result = ''
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

export const userService = {
  handleUserAdd
}
