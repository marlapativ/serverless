import { CloudEvent, cloudEvent } from '@google-cloud/functions-framework'
import { UserAddCloudEvent, userService } from './user.service'
import env from './config/env'
import sendGridClient from '@sendgrid/mail'
import database from './config/database'

const initializeApp = async () => {
  env.loadEnv()
  sendGridClient.setApiKey(env.getOrDefault('SENDGRID_API_KEY', ''))
  await database.syncDatabase()
}

type GoogleCloudEvent = {
  message: {
    data: string
    messageId: string
  }
}

cloudEvent('addUser', async (cloudEvent: CloudEvent<GoogleCloudEvent>) => {
  console.log('Received addUser event')
  const data = cloudEvent?.data?.message?.data
  if (data === undefined || data === null) {
    console.log('No data in the event. Exiting...')
    return
  }

  const messageId = cloudEvent?.data?.message?.messageId

  const decoded = Buffer.from(data as string, 'base64').toString('utf-8')
  let user: UserAddCloudEvent
  try {
    user = JSON.parse(decoded) as UserAddCloudEvent
  } catch (error) {
    console.error('Error parsing addUser event data: ', error)
    return
  }

  console.log('Parsed addUser event. UserId: ', user?.userId)

  await initializeApp()
  await userService.handleUserAdd(user, messageId)
})
