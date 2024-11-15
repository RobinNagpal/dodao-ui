import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { SendEmailInput, useSendEmailMutation } from '@/graphql/generated/generated-types';
import { useState } from 'react';

export function TextField({ id, label, type = 'text', onChange, ...props }: any) {
  return (
    <div>
      <label className="block text-sm/6 text-gray-900">{label}</label>
      <div className="mt-2.5">
        <input
          id={id}
          type={type}
          {...props}
          onChange={onChange}
          className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm/6"
        />
      </div>
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
        heading: 'Success🎉',
        message: 'Email sent successfully!',
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
    <FullPageModal open={open} onClose={onClose} title={'Contact DoDAO'}>
      <div className="p-6 text-left">
        <form action="#" method="POST" className="mx-auto max-w-xl" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <TextField label="First name" id="firstName" name="firstName" type="text" autoComplete="given-name" required onChange={handleChange} />
            <TextField label="Last name" id="lastName" name="lastName" type="text" autoComplete="family-name" required onChange={handleChange} />
            <div className="sm:col-span-2">
              <TextField label="Email address" id="email" name="email" type="email" autoComplete="email" required onChange={handleChange} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="message" className="block text-sm/6 text-gray-900">
                Message
              </label>
              <div className="mt-2.5">
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm/6"
                  defaultValue={''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="mt-10">
            <Button type="submit" variant="contained" primary={true} className="w-full rounded-md" removeBorder={true}>
              <span>{`Let's talk`}</span>
            </Button>
          </div>
        </form>
      </div>
    </FullPageModal>
  );
}
