import { cloudEvent } from '@google-cloud/functions-framework'
import { UserAddCloudEvent, userService } from './user.service'
import env from './config/env'
import Email from './model/email.model'

const initializeApp = async () => {
  env.loadEnv()
  await Email.sync()
}

cloudEvent<string>('addUser', async (cloudEvent) => {
  await initializeApp()
  console.log('Received addUser event')
  if (cloudEvent.data === undefined) return

  const decoded = Buffer.from(cloudEvent.data as string, 'base64').toString('utf-8')
  const user = JSON.parse(decoded) as UserAddCloudEvent
  console.log('Received addUser event. UserId: ', user?.userId)

  await userService.handleUserAdd(user)
})
