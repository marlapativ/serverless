import env from './config/env'
import Email from './model/email.model'
import { EmailParams, EmailServiceFactory } from './services/email.service'

export type UserAddCloudEvent = {
  userId: string
  email: string
}

const getVerifyUrl = (verifyUrl: string, email: string, authToken: string) => {
  return `${verifyUrl}?email=${email}&auth_token=${authToken}`
}

const validateUserAddEvent = (addUser?: UserAddCloudEvent): boolean => {
  if (!addUser) {
    console.error('Missing addUser event')
    return false
  }

  if (!addUser.userId) {
    console.error('Missing userId')
    return false
  }

  if (!addUser.email) {
    console.error('Missing email')
    return false
  }

  return true
}

/**
 * Handle user add event
 * @param addUser UserAddCloudEvent User add event
 * @param messageId string Pub/Sub message ID
 */
const handleUserAdd = async (addUser?: UserAddCloudEvent, messageId?: string) => {
  // Validate input
  if (!validateUserAddEvent(addUser)) {
    console.log('Invalid addUser event. Exiting...')
    return
  }

  sendVerificationEmail(addUser, messageId)
}

/**
 * Send verification email to user
 * @param addUser UserAddCloudEvent User add event
 * @param messageId string Pub/Sub message ID
 * @returns boolean
 */
const sendVerificationEmail = async (addUser: UserAddCloudEvent, messageId?: string) => {
  const { userId, email } = addUser

  console.log('Sending verification email for user with ID: ' + userId)
  const existingEmail = await Email.findOne({ where: { user_id: userId, email_type: 'VERIFY' } })
  if (existingEmail) {
    console.error('User Verification email already sent for user: ' + userId)
    return
  }

  const authToken = randomString(128)

  const verifyUrlPrefix = env.getOrDefault('VERIFY_URL', '')
  const verifyEmailTemplateId = env.getOrDefault('VERIFY_EMAIL_TEMPLATE_ID', '')
  const verifyUrl = getVerifyUrl(verifyUrlPrefix, email, authToken)
  const emailParams: EmailParams = {
    to: email,
    subject: 'Thanks for signing up!',
    templateId: verifyEmailTemplateId,
    dynamicTemplateData: {
      verifyUrl: verifyUrl
    }
  }

  const result = await EmailServiceFactory.get().sendEmail(emailParams)
  if (!result.success) {
    console.error('Error sending verification email.')
    return
  }

  // Create email record
  console.log('Creating email record')
  try {
    const email = await Email.create({
      user_id: userId,
      sent_date: new Date(),
      email_type: 'VERIFY',
      auth_token: authToken,
      metadata: {
        email: {
          provider: result.provider,
          message_id: result.messageId
        },
        pubsub: {
          message_id: messageId || ''
        }
      }
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
