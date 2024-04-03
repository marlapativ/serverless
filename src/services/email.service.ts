import sendGridClient from '@sendgrid/mail'
import Mailgun from 'mailgun.js'
import FormData from 'form-data'
import env from '../config/env'
import { IMailgunClient } from 'mailgun.js/Interfaces'

export type EmailParams = {
  to: string
  from?: string
  subject: string
  templateId: string
  dynamicTemplateData: {
    [key: string]: any
  }
}

type EmailDeliveryResult = {
  messageId: string
  success: boolean
  provider: string
}

type EmailServiceOptions = {
  apiKey: string
  domain: string
  from: string
}

export interface IEmailService {
  provider: string
  sendEmail(emailParams: EmailParams): Promise<EmailDeliveryResult>
}

class SendGridEmailService implements IEmailService {
  provider: string
  options: EmailServiceOptions

  constructor(options: EmailServiceOptions) {
    this.provider = 'SendGrid'
    this.options = options
    sendGridClient.setApiKey(options.apiKey)
  }

  async sendEmail(emailParams: EmailParams): Promise<EmailDeliveryResult> {
    const emailDeliveryResult = {
      messageId: '',
      success: false,
      provider: this.provider
    }
    const result = await sendGridClient.send({
      to: emailParams.to,
      from: emailParams.from ?? this.options.from,
      subject: emailParams.subject,
      templateId: emailParams.templateId,
      dynamicTemplateData: emailParams.dynamicTemplateData
    })
    console.log('email status: ', result[0].statusCode)
    if (result[0].statusCode >= 300) {
      console.error('Error sending email. Message: ', result[0].body)
      return emailDeliveryResult
    }

    console.log('Email sent successfully. Message ID: ' + result[0].headers['x-message-id'])
    emailDeliveryResult.success = true
    emailDeliveryResult.messageId = result[0].headers['x-message-id']
    return emailDeliveryResult
  }
}

class MailGunEmailService implements IEmailService {
  provider: string
  mgClient: IMailgunClient
  options: EmailServiceOptions

  constructor(options: EmailServiceOptions) {
    this.options = options
    this.provider = 'MailGun'
    this.mgClient = new Mailgun(FormData).client({ username: 'api', key: options.apiKey })
  }

  async sendEmail(emailParams: EmailParams): Promise<EmailDeliveryResult> {
    const data = {
      to: emailParams.to,
      from: emailParams.from ?? this.options.from,
      subject: emailParams.subject,
      template: emailParams.templateId,
      'h:X-Mailgun-Variables': emailParams.dynamicTemplateData
    }

    const emailDeliveryResult = {
      messageId: '',
      success: false,
      provider: this.provider
    }
    const result = await this.mgClient.messages.create(this.options.domain, data)
    console.log('email status: ', result.status)
    if (result.status >= 300) {
      console.error('Error sending email. Message: ', result.details)
      return emailDeliveryResult
    }

    console.log('Email sent successfully. Message ID: ' + result?.id)
    emailDeliveryResult.success = true
    emailDeliveryResult.messageId = result.id
    return emailDeliveryResult
  }
}

const EmailServiceFactory = {
  get: (): IEmailService => {
    const provider: string = env.getOrDefault('EMAIL_PROVIDER', 'SendGrid')
    const options: EmailServiceOptions = {
      apiKey: env.getOrDefault('EMAIL_PROVIDER_API_KEY', ''),
      domain: env.getOrDefault('DOMAIN', ''),
      from: env.getOrDefault('EMAIL_FROM', '')
    }

    switch (provider) {
      case 'MailGun':
        return new MailGunEmailService(options)
      case 'SendGrid':
      default:
        return new SendGridEmailService(options)
    }
  }
}

export { EmailServiceFactory }
