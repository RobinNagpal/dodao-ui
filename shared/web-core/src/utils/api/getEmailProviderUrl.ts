export const getEmailProviderUrl = (email: string): string | null => {
    const domain = email.split('@')[1];
  
    switch (domain) {
      case 'gmail.com':
        return 'https://mail.google.com/';
      case 'yahoo.com':
        return 'https://mail.yahoo.com/';
      case 'outlook.com':
        return 'https://outlook.live.com/';
      case 'hotmail.com':
        return 'https://outlook.live.com/';
      case 'icloud.com':
        return 'https://www.icloud.com/mail';
      default:
        return null;
    }
  };
  