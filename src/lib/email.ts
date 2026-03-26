import nodemailer from "nodemailer";

function buildTransport(host: string, port: number, secure: boolean) {
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
}

function getCandidates() {
  const hostEnv = String(process.env.EMAIL_SERVER_HOST || "");
  const portEnv = parseInt(process.env.EMAIL_SERVER_PORT || "465");
  const secureEnv = portEnv === 465;
  const altPort = portEnv === 465 ? 587 : 465;
  const altSecure = altPort === 465;
  const titanBase = hostEnv.includes("titan.email") ? "smtp.titan.email" : hostEnv;
  const candidates: Array<{ host: string; port: number; secure: boolean }> = [
    { host: hostEnv || titanBase, port: portEnv, secure: secureEnv },
    { host: hostEnv || titanBase, port: altPort, secure: altSecure },
    { host: titanBase, port: portEnv, secure: secureEnv },
  ];
  return candidates;
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<{ ok: boolean; accepted?: Array<string>; rejected?: Array<string>; response?: string; error?: any }> {
  const candidates = getCandidates();
  let lastErr: any = null;
  for (const c of candidates) {
    try {
      const transporter = buildTransport(c.host, c.port, c.secure);
      const info = await transporter.sendMail({
        from: `"${process.env.APP_NAME || 'Stickylynx'}" <${process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER}>`,
        to,
        subject,
        html,
      });
      const accepted = Array.isArray(info.accepted) ? info.accepted.map((x: any) => String(x)) : [];
      const rejected = Array.isArray(info.rejected) ? info.rejected.map((x: any) => String(x)) : [];
      const ok = accepted.length > 0;
      if (ok) return { ok, accepted, rejected, response: info.response };
      lastErr = info.response || "Unknown send error";
    } catch (error) {
      lastErr = error;
    }
  }
  return { ok: false, error: lastErr };
}

export async function verifyTransport(): Promise<{ ok: boolean; error?: any }> {
  const candidates = getCandidates();
  for (const c of candidates) {
    try {
      const transporter = buildTransport(c.host, c.port, c.secure);
      await transporter.verify();
      return { ok: true };
    } catch (error) {
      if (c === candidates[candidates.length - 1]) {
        return { ok: false, error };
      }
    }
  }
  return { ok: false, error: "No transport candidates" };
}
