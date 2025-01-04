declare module 'nodemailer-mailgun-transport' {
  import { TransportOptions } from 'nodemailer';
  
  interface MailgunTransportOptions {
    auth: {
      api_key: string;
      domain: string;
    };
  }

  function mailgunTransport(options: MailgunTransportOptions): TransportOptions;
  export = mailgunTransport;
} 