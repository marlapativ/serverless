import { cloudEvent } from '@google-cloud/functions-framework'
import { UserAddCloudEvent, userService } from './user.service'
import env from './config/env'
import Email from './model/email.model'

const initializeApp = async () => {
  env.loadEnv()
  await Email.sync()
}

cloudEvent<UserAddCloudEvent>('addUser', async (cloudEvent) => {
  await initializeApp()
  console.log('Received addUser event. UserId: ', cloudEvent.data?.userId)
  await userService.handleUserAdd(cloudEvent.data)
})
