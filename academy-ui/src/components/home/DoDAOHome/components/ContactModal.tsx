import Button from '@/components/core/buttons/Button';
import FullPageModal from '@/components/core/modals/FullPageModal';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { SendEmailInput, useSendEmailMutation } from '@/graphql/generated/generated-types';
import clsx from 'clsx';
import { useState } from 'react';

const formClasses =
  'block w-full appearance-none rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-blue-500 sm:text-sm';

function Label({ id, children }: any) {
  return (
    <label htmlFor={id} className="mb-3 block text-sm font-medium text-gray-700">
      {children}
    </label>
  );
}
export function TextField({ id, label, type = 'text', className = '', onChange, ...props }: any) {
  return (
    <div className={className}>
      {label && <Label id={id}>{label}</Label>}
      <input id={id} type={type} {...props} className={formClasses} onChange={onChange} />
    </div>
  );
}

export function TextAreaField({ id, label, placeholder, className = '', minLength = 1000, onChange, ...props }: any) {
  return (
    <div className={className}>
      {label && <Label id={id}>{label}</Label>}
      <textarea id={id} minLength={minLength} {...props} className={formClasses} placeholder={placeholder} onChange={onChange} />
    </div>
  );
}

export function SelectField({ id, label, className = '', onChange, ...props }: any) {
  return (
    <div className={className}>
      {label && <Label id={id}>{label}</Label>}
      <select id={id} {...props} className={clsx(formClasses, 'pr-8')} onChange={onChange} />
    </div>
  );
}
export default function ContactModal({ open, onClose }: any) {
  const { showNotification } = useNotificationContext();
  const [sendEmailMutation] = useSendEmailMutation();
  const [form, setForm] = useState<SendEmailInput>({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await sendEmailMutation({ variables: { input: form } });
      showNotification({
        type: 'success',
        message: 'Email sent successfully',
      });
      onClose();
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Error sending email',
      });
      console.error('Error sending email:', error);
    }
  };

  return (
    <FullPageModal open={open} onClose={onClose} title={'Get started for free'}>
      <div className="p-16">
        <form action="#" className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2" onSubmit={handleSubmit}>
          <TextField label="First name" id="firstName" name="firstName" type="text" autoComplete="given-name" required onChange={handleChange} />
          <TextField label="Last name" id="lastName" name="lastName" type="text" autoComplete="family-name" required onChange={handleChange} />
          <TextField
            className="col-span-full"
            label="Email address"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            onChange={handleChange}
          />
          <TextAreaField
            className="col-span-full"
            label="Message"
            name="message"
            placeholder="Enter your message here"
            required
            minLength={30}
            onChange={handleChange}
          />

          <div className="col-span-full">
            <Button type="submit" variant="contained" primary={true} className="w-full">
              <span>
                Submit <span aria-hidden="true">&rarr;</span>
              </span>
            </Button>
          </div>
        </form>
      </div>
    </FullPageModal>
  );
}
