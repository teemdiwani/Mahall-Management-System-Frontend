async function testRelay() {
  try {
    const res = await fetch('https://mahallmanager-theta.vercel.app/api/mail-relay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: 'diwani_mahall_mailer_secure_2026',
        to: 'nafihkottankodan@gmail.com',
        subject: 'Test from Vercel Nodemailer Relay',
        text: 'Hello Nafi! Nodemailer mail relay test.',
      }),
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error(err);
  }
}
testRelay();
