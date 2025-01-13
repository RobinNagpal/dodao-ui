import AWS from 'aws-sdk';

const s3 = new AWS.S3();
const bucketName = process.env.EMAIL_BUCKET_NAME!;
const emailFileKey = 'email-list.csv';

type RequestBody = {
  email?: string;
  action?: string;
};

export const manageSubscription = async (event: any) => {
  console.log("Event received:", JSON.stringify(event, null, 2));

  // Extract the HTTP method and other details from the event
  const method = event.requestContext?.http?.method; // Use the correct path for HTTP method
  
  // Decode and parse the body
  let body: RequestBody = {};
  if (event.body) {
    body = JSON.parse(event.body);
  }

  console.log("Parsed body:", body);
  const { email, action } = body;

  if (method === 'GET') {
    // Return the HTML form
    const html = `
      <!DOCTYPE html>
      <html>

      <head>
          <title>Email Subscription</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #1a202c;
                  text-align: center;
                  margin: 0;
                  padding: 0;
              }

              .unsubscribe {
                  display: none;
              }

              .container {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
              }

              .content-box {
                  position: relative;
                  overflow: hidden;
              }

              .title {
                  max-width: 48rem;
                  margin: 0 auto;
                  text-align: center;
                  font-size: 2.25rem;
                  font-weight: 600;
                  color: #ffffff;
                  line-height: 1.25;
              }

              @media (min-width: 640px) {
                  .title {
                      font-size: 3rem;
                  }
              }

              .description {
                  max-width: 32rem;
                  margin: 1.5rem auto 0;
                  text-align: center;
                  font-size: 1.125rem;
                  color: #d1d5db;
                  line-height: 1.75;
              }

              .form {
                  display: flex;
                  max-width: 24rem;
                  gap: 1rem;
                  margin: 2.5rem auto 0;
              }

              .email-input {
                  flex: 1;
                  min-width: 0;
                  padding: 0.625rem 0.875rem;
                  background-color: rgba(255, 255, 255, 0.05);
                  color: #ffffff;
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  border-radius: 0.375rem;
                  font-size: 1rem;
              }

              .email-input::placeholder {
                  color: #9ca3af;
              }

              .lowerText {
                  color: #9ca3af;
              }

              .clickHereLink {
                  text-decoration: underline;
                  color: white
              }

              .email-input:focus {
                  outline: 2px solid #ffffff;
                  outline-offset: -2px;
              }

              .notify-button {
                  padding: 0.625rem 0.875rem;
                  background-color: #ffffff;
                  color: #1a202c;
                  font-size: 0.875rem;
                  font-weight: 600;
                  border: none;
                  border-radius: 0.375rem;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  cursor: pointer;
                  transition: background-color 0.3s;
              }

              .notify-button:hover {
                  background-color: #f3f4f6;
              }

              .notify-button:focus {
                  outline: 2px solid #ffffff;
                  outline-offset: 2px;
              }

              .background-svg {
                  position: absolute;
                  left: 50%;
                  bottom: 0%;
                  transform: translate(-50%, 75%);
                  width: 64rem;
                  z-index: -10;
              }
          </style>
      </head>

      <body>
          <div class="container">
              <div class="content-box">
                  <h2 class="title">Subscribe to Report</h2>
                  <p class="description">
                      Subscribe to Compound Proposal Seatbelt Report and receive the checks summary directly to your
                      email.
                  </p>
                  <form class="form" id="subscription-form">
                      <!-- <label for="email-address" class="sr-only">Email address</label> -->
                      <input id="email" name="email" type="email" autocomplete="email" required class="email-input"
                          placeholder="Enter your email" />
                      <button type="button" id="subscribe-btn" class="notify-button">Subscribe</button>
                      <button type="button" id="unsubscribe-btn" class="unsubscribe notify-button">Unsubscribe</button>
                  </form>
                  <p class="lowerText">Want to unsubscribe? <a href="#" class="clickHereLink"
                          onclick="toggleUnsubscribe()">Click here</a></p>
              </div>
              <svg viewBox="0 0 1024 1024" class="background-svg" aria-hidden="true">
                  <circle cx="512" cy="512" r="512" fill="url(#gradient)" fill-opacity="0.7"></circle>
                  <defs>
                      <radialGradient id="gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
                          gradientTransform="translate(512 512) rotate(90) scale(512)">
                          <stop stop-color="#7775D6" />
                          <stop offset="1" stop-color="#E935C1" stop-opacity="0" />
                      </radialGradient>
                  </defs>
              </svg>
          </div>

          <script>
              const form = document.getElementById('subscription-form');
              const subscribeBtn = document.getElementById('subscribe-btn');
              const unsubscribeBtn = document.getElementById('unsubscribe-btn');
              const toggleText = document.querySelector('.lowerText');

              const sendRequest = async (email, action) => {
                  const response = await fetch('/email-subscription', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ email, action }),
                  });
                  const result = await response.text();
                  alert(result);
              };

              subscribeBtn.addEventListener('click', () => {
                  const email = form.email.value;
                  if (email) sendRequest(email, 'subscribe');
              });

              unsubscribeBtn.addEventListener('click', () => {
                  const email = form.email.value;
                  if (email) sendRequest(email, 'unsubscribe');
              });

              function toggleUnsubscribe() {
                  if (subscribeBtn.style.display === 'none') {
                      // Switch to Subscribe mode
                      subscribeBtn.style.display = 'inline';
                      unsubscribeBtn.style.display = 'none';
                      toggleText.innerHTML = \`Want to unsubscribe? <a href="#" class="clickHereLink" onclick="toggleUnsubscribe()">Click here</a>\`;
                  } else {
                      // Switch to Unsubscribe mode
                      subscribeBtn.style.display = 'none';
                      unsubscribeBtn.style.display = 'inline';
                      toggleText.innerHTML = \`Want to subscribe? <a href="#" class="clickHereLink" onclick="toggleUnsubscribe()">Click here</a>\`;
                  }
              }
          </script>
      </body>

      </html>`;
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
      },
      body: html,
    };
  }

  if (method === 'POST') {
    // Handle subscription logic
    if (!email || !action) {
      return { statusCode: 400, body: 'Email and action are required.' };
    }

    try {
      const file = await s3.getObject({ Bucket: bucketName, Key: emailFileKey }).promise();
      const emails = file.Body?.toString('utf-8').split(',') || [];

      if (action === 'subscribe' && !emails.includes(email)) {
        emails.push(email);
      } else if (action === 'unsubscribe') {
        const index = emails.indexOf(email);
        if (index !== -1) emails.splice(index, 1);
      }

      await s3
        .putObject({
          Bucket: bucketName,
          Key: emailFileKey,
          Body: emails.join(','),
          ContentType: 'text/plain',
        })
        .promise();

      return {
        statusCode: 200,
        body: `${action === 'subscribe' ? 'Subscribed' : 'Unsubscribed'} successfully.`,
      };
    } catch (error: any) {
      if (error.code === 'NoSuchKey') {
        if (action === 'subscribe') {
          await s3
            .putObject({
              Bucket: bucketName,
              Key: emailFileKey,
              Body: email,
              ContentType: 'text/plain',
            })
            .promise();
          return { statusCode: 200, body: 'Subscribed successfully.' };
        }
        return { statusCode: 400, body: 'No email list found for unsubscribing.' };
      }

      console.error(error);
      return { statusCode: 500, body: 'Internal Server Error.' };
    }
  }

  return {
    statusCode: 405,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ message: 'Method Not Allowed' }),
  };
};
